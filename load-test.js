import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 150 },
    { duration: '1m', target: 250 },
  ],
};

export default function () {
  http.get('https://ca-capuchesdopale-dev-api.prouddune-d21624fd.francecentral.azurecontainerapps.io/api/health');
  sleep(1);
}