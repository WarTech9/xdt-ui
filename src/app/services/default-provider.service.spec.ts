import { TestBed } from '@angular/core/testing';

import { DefaultProviderService } from './default-provider.service';

describe('DefaultProviderService', () => {
  let service: DefaultProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefaultProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
