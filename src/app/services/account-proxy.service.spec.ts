import { TestBed } from '@angular/core/testing';

import { AccountProxyService } from './account-proxy.service';

describe('AccountProxyService', () => {
  let service: AccountProxyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountProxyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
