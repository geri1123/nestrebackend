import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },  // warm up
        { duration: '30s', target: 500 },  // ramp to 500
        { duration: '30s', target: 1000 }, // ramp to 1k
        { duration: '30s', target: 2000 }, // ramp to 2k
        { duration: '1m',  target: 2000 }, // hold at 2k
        { duration: '30s', target: 0 },    // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed:   ['rate<0.01'],
  },
};

export default function () {
  const url = 'http://192.168.0.103:8080/products/search';

  const res = http.get(url, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { 'status 200': (r) => r.status === 200 });

  sleep(1);
}