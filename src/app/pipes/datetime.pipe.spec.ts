import { DatetimePipe } from './datetime.pipe';

describe('DatetimePipe', () => {
  let pipe: DatetimePipe;

  beforeEach(() => {
    pipe = new DatetimePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return an empty string if no value is given', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should format the datetime', () => {
    const testDate = '2025-12-12T05:30:00Z';
    const date = new Date(testDate);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    const retVal = pipe.transform(
      testDate
    );

    expect(retVal).toBe(`${dateStr} ${timeStr}`);
  });
});
