import { createSpyFromClass } from 'jest-auto-spies';
import { firstValueFrom, of } from 'rxjs';
import { ApertiumService } from '../../services/apertium.service';
import { SearchComponent } from './search.component';

const mockApertiumService = createSpyFromClass(ApertiumService);
const langList = [
  { code: 'it', name: 'Italian', pairsWith: ['spa'] },
  { code: 'eng', name: 'English', pairsWith: ['spa'] },
  { code: 'spa', name: 'Spanish', pairsWith: ['it', 'eng'] }
];

describe('SearchComponent', () => {
  let component: SearchComponent;

  beforeEach(async () => {
    mockApertiumService.getLanguages.mockReturnValue(
      of(langList)
    );

    component = new SearchComponent(
      mockApertiumService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('languages stream', () => {
    it('should populate languages', (done) => {
      component.languages$.subscribe(
        (langs) => {
          expect(langs).toStrictEqual(langList);
          done();
        }
      );
    });
  });

  describe('source$ stream', () => {
    it('should set the source language', (done) => {
      component.sourceSubject.next('eng');

      component.source$.subscribe(
        (res) => {
          expect(res).toBe('eng');
          done();
        }
      );
    });
  });

  describe('target$ stream', () => {
    it('should set the target language', (done) => {
      component.targetSubject.next('nld');

      component.target$.subscribe(
        (tar) => {
          expect(tar).toBe('nld');
          done();
        }
      );
    });
  });

  describe('targetLanguages$ stream', () => {
    it('should filter out languages the source cannot target', (done) => {
      component = new SearchComponent(mockApertiumService);
      component.languages$.subscribe();

      component.sourceSubject.next('eng');

      component.targetLanguages$.subscribe(
        (res) => {
          expect(res).toStrictEqual([
            { code: 'spa', name: 'Spanish', pairsWith: ['it', 'eng'] }
          ]);
          done();
        }
      );
    });

    it('set targetLanguages to languages if source is auto', (done) => {
      component = new SearchComponent(mockApertiumService);
      component.languages$.subscribe();

      component.targetSubject.next('nld');
      component.sourceSubject.next('auto');

      component.targetLanguages$.subscribe(
        (res) => {
          expect(res).toStrictEqual(langList);
          done();
        }
      );
    });
  });

  describe('translate$ stream', () => {
    it('should not translate if there is no source', async () => {
      component.sourceSubject.next('eng');
      component.targetSubject.next('spa');
      component.translateSubject.next();

      await firstValueFrom(component.translate$);

      expect(mockApertiumService.translate).not.toHaveBeenCalled();
    });
  });
});
