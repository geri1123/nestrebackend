import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseService } from '../firebase.service';
import { AppConfigService } from '../../config/config.service';

// Mock Firebase Admin
// Mock Firebase Admin
jest.mock('firebase-admin', () => {
  const mockFile = {
    delete: jest.fn(),
    getSignedUrl: jest.fn().mockResolvedValue(['http://signed-url']),
  };
  const mockBucket = {
    file: jest.fn().mockReturnValue(mockFile),
  };
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    }),
  };
});

describe('FirebaseService', () => {
  let service: FirebaseService;

  const configMock = {
    firebaseProjectId: 'proj',
    firebasePrivateKey: 'key',
    firebaseClientEmail: 'email@firebase.com',
    firebaseClientId: 'id',
    firebaseBucket: 'bucket-name',
  } as Partial<AppConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseService,
        { provide: AppConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<FirebaseService>(FirebaseService);
    service.onModuleInit(); // initialize bucket
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the bucket', () => {
    expect(service.getBucket()).toBeDefined();
  });

  it('should generate public URL', () => {
    const url = service.getPublicUrl('folder/file.txt');
    expect(url).toBe('https://storage.googleapis.com/bucket-name/folder/file.txt');
  });

  it('should return null for null path', () => {
    expect(service.getPublicUrl(null)).toBeNull();
  });
});
