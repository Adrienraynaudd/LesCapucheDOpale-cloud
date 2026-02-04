import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Upload } from './upload';
import { environment } from '../../../environments/environment';

describe('Upload', () => {
  let service: Upload;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/upload`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        Upload,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(Upload);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postFile', () => {
    it('should send POST request to upload endpoint with file', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
      const mockResponse = { url: 'http://example.com/test-file.txt' };

      service.postFile(mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(mockFile);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockFile = new File(['test content'], 'test-file.txt', { type: 'text/plain' });

      service.postFile(mockFile).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('postFileImage', () => {
    it('should send POST request to upload/image endpoint with file', () => {
      const mockFile = new File(['image content'], 'test-image.png', { type: 'image/png' });
      const mockResponse = { url: 'http://example.com/test-image.png' };

      service.postFileImage(mockFile).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/image`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(mockFile);
      req.flush(mockResponse);
    });

    it('should handle error response', () => {
      const mockFile = new File(['image content'], 'test-image.png', { type: 'image/png' });

      service.postFileImage(mockFile).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(413);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/image`);
      req.flush('File too large', { status: 413, statusText: 'Payload Too Large' });
    });
  });

  describe('getAllFiles', () => {
    it('should send GET request to upload/list endpoint', () => {
      const mockResponse = [
        { name: 'file1.txt', url: 'http://example.com/file1.txt' },
        { name: 'file2.png', url: 'http://example.com/file2.png' },
      ];

      service.getAllFiles().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(2);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when no files exist', () => {
      service.getAllFiles().subscribe((response) => {
        expect(response).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush([]);
    });

    it('should handle error response', () => {
      service.getAllFiles().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/list`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});
