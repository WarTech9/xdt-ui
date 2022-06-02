import { TestBed } from '@angular/core/testing';

import { UxdClientService } from './uxd-client.service';

describe('UxdClientService', () => {
  let service: UxdClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UxdClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
