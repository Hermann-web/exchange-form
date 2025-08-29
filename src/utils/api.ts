// utils/api.ts
import { authApi as edgeFunctionsAuthApi } from './api-firebase';

import type { AuthApiInterface } from '@/types/api';

// Strategy selection logic
function getApiImplementation(): {
  authApi: AuthApiInterface;
  // dossierApi: DossierApiInterface;
} {
  return {
    authApi: edgeFunctionsAuthApi,
    //   financeApi: edgeFunctionsFinanceApi,
  };
}

const { authApi } = getApiImplementation();

export { authApi };
export default { authApi };
