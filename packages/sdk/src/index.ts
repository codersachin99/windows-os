import type { AppDefinition } from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";

// Public, reusable app-registration contract. App implementations live separately
// from the shell. Never mark an app migrated just because its icon is registered.
const builtinApps: AppDefinition[] = [
  {
    id: "bin", label: "Recycle Bin", icon: legacyArt.recycleBin,
    kind: "system", desktop: true, showInStart: false,
    window: { width: 640, height: 450 }
  },
  {
    id: "computer", label: "Computer", icon: legacyArt.computer,
    kind: "system", desktop: true, showInStart: true,
    window: { width: 760, height: 490 }
  },
  {
    id: "web_contacts", label: "Contacts", icon: legacyArt.contacts,
    kind: "web", desktop: true, showInStart: true,
    window: { width: 780, height: 520 }
  }
];

export class AppRegistry {
  private readonly apps = new Map<string, AppDefinition>();
  constructor(initial: readonly AppDefinition[] = []) {
    for (const app of initial) this.register(app);
  }
  register(app: AppDefinition): void {
    if (!/^[a-z][a-z0-9_-]*$/.test(app.id)) throw new Error(`Invalid app id: ${app.id}`);
    if (this.apps.has(app.id)) throw new Error(`Duplicate app id: ${app.id}`);
    this.apps.set(app.id, Object.freeze({ ...app, window: { ...app.window } }));
  }
  get(id: string): AppDefinition | undefined { return this.apps.get(id); }
  list(): AppDefinition[] { return [...this.apps.values()]; }
  desktop(): AppDefinition[] { return this.list().filter(app => app.desktop); }
  startMenu(): AppDefinition[] { return this.list().filter(app => app.showInStart); }
}

export const appRegistry = new AppRegistry(builtinApps);
