export class Sidebar {
  constructor() {}

  async startup(): Promise<void> {
    const manifest = await import('./manifest.json');
    console.log('Extension initialized:', manifest);
  }
}
