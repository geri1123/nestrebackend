
// ---------- KONFIGURIMI ----------
const API_URL = 'http://localhost:8080';
const JWT            = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImp0aSI6ImY4ZDgxZDg5MWMwMDM5MWNmNDdmZDM2NTMyMjQ0YWRmIiwiaWF0IjoxNzc5MTk2MTg4LCJleHAiOjE3NzkyMTc3ODh9.x95LNT8r3NV6PfUIj4qIUaIwJl2-HlAbOeERYYlS18w';          // Token i userit (nga login)
const AMOUNT_EACH    = 10;                          // €N për çdo topup
const PARALLEL_COUNT = 10;                          // Sa topups paralelisht
// ----------------------------------

const log = {
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
  ok:   (msg) => console.log(`\x1b[32m${msg}\x1b[0m`),
  fail: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`),
  dim:  (msg) => console.log(`\x1b[90m${msg}\x1b[0m`),
  bold: (msg) => console.log(`\x1b[1m${msg}\x1b[0m`),
};

async function getBalance() {
  const res = await fetch(`${API_URL}/wallet/get`, {
    headers: { Authorization: `Bearer ${JWT}` },
  });
  if (!res.ok) {
    throw new Error(
      `Nuk u mor balanca (${res.status}). A është JWT-ja valide? A punon server-i?`
    );
  }
  const data = await res.json();
  return (
    data?.data?.balance ??
    data?.data?.wallet?.balance ??
    data?.balance ??
    null
  );
}

async function topup(amount) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${API_URL}/wallet/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT}`,
      },
      body: JSON.stringify({ amount }),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body, ms: Date.now() - t0 };
  } catch (err) {
    return { ok: false, status: 0, body: { error: err.message }, ms: Date.now() - t0 };
  }
}

(async () => {
  log.bold('\n=== Race Condition Test për Wallet ===\n');

  if (JWT === 'VENDOS_JWT_KETU') {
    log.fail('✗ Nuk ke vendosur JWT-në. Edito file-in dhe vendos JWT te variabli.');
    process.exit(1);
  }

  let balanceBefore;
  try {
    balanceBefore = await getBalance();
  } catch (err) {
    log.fail(`✗ ${err.message}`);
    process.exit(1);
  }

  if (balanceBefore === null) {
    log.fail('✗ Nuk u gjet `balance` në response. Kontrollo strukturën e /wallet/get.');
    process.exit(1);
  }

  log.dim(`Konfigurimi:`);
  log.dim(`  API           : ${API_URL}`);
  log.dim(`  Topups        : ${PARALLEL_COUNT} × €${AMOUNT_EACH} = €${PARALLEL_COUNT * AMOUNT_EACH}`);
  log.dim(`  Balanca para  : €${balanceBefore}\n`);

  log.info(`→ Po dërgoj ${PARALLEL_COUNT} topups në të njëjtën milisekondë...`);
  const t0 = Date.now();

  const results = await Promise.allSettled(
    Array(PARALLEL_COUNT).fill(0).map(() => topup(AMOUNT_EACH))
  );

  const totalMs = Date.now() - t0;

  const successful = results.filter(
    (r) => r.status === 'fulfilled' && r.value.ok
  ).length;
  const failed = results.length - successful;

  let balanceAfter;
  try {
    balanceAfter = await getBalance();
  } catch (err) {
    log.fail(`✗ ${err.message}`);
    process.exit(1);
  }

  const expected = balanceBefore + successful * AMOUNT_EACH;
  const diff = balanceAfter - expected;

  console.log();
  log.bold(`--- Rezultati (${totalMs}ms total) ---`);
  console.log(`Sukses        : ${successful} / ${PARALLEL_COUNT}`);
  console.log(`Dështim       : ${failed}`);
  console.log(`Balanca pas   : €${balanceAfter}`);
  console.log(`Balanca pritej: €${expected}`);
  console.log(`Diferenca     : €${diff}`);
  console.log();

  if (failed > 0) {
    log.fail('Disa request dështuan:');
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && !r.value.ok) {
        log.dim(`  [${i}] status=${r.value.status} body=${JSON.stringify(r.value.body)}`);
      } else if (r.status === 'rejected') {
        log.dim(`  [${i}] rejected: ${r.reason}`);
      }
    });
    console.log();
  }

  if (diff === 0) {
    log.ok('✓ KALOI — race condition është ZGJIDHUR plotësisht.');
    log.ok(`  Balanca u rrit saktësisht me ${successful} × €${AMOUNT_EACH} = €${successful * AMOUNT_EACH}.`);
  } else if (diff < 0) {
    log.fail(`✗ DËSHTOI — humbën €${-diff} (race condition akoma ekziston).`);
    log.fail(`  Disa update-e u mbishkruan nga të tjerët.`);
  } else {
    log.fail(`✗ ÇUDITSHME — balanca është €${diff} më shumë se sa duhej.`);
  }
  console.log();
})();