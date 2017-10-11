import { NemexAngular2ViewpagerPage } from './app.po';

describe('nemex-angular2-viewpager App', () => {
  let page: NemexAngular2ViewpagerPage;

  beforeEach(() => {
    page = new NemexAngular2ViewpagerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
