import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 1000 },
        { duration: '30s', target: 2000 },
        { duration: '1m',  target: 2000 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration:                          ['p(95)<2000'],
    http_req_failed:                            ['rate<0.01'],
    'http_req_duration{endpoint:getFilters}':   ['p(95)<500'],
    'http_req_duration{endpoint:getCountries}': ['p(95)<500'],
  },
};

const BASE_URL = 'http://192.168.0.103:8080/filters';
const COUNTRY_CODES = ['AL'];

function safeJson(r) {
  try { return JSON.parse(r.body); } catch { return null; }
}

export default function () {
  const headers = { 'Content-Type': 'application/json', 'Accept-Language': 'al' };

  group('getFilters', () => {
    const res = http.get(BASE_URL, { headers, tags: { endpoint: 'getFilters' } });
    const body = safeJson(res);
    check(res, {
      'getFilters status 200':  (r) => r.status === 200,
      'getFilters has success': () => body !== null && body.success === true,
    });
  });

  sleep(0.5);


}