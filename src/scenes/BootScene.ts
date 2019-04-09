import { BaseScene } from './BaseScene';

export class BootScene extends BaseScene {
	constructor(key: string, options: any) {
		super('BootScene');
	}

	public preload(): void {
		this.load.bitmapFont('silk', './assets/fonts/silkscreen.png', './assets/fonts/silkscreen.xml');
	}

	public init(): void {
		this.registry.set('wave', 0);
		this.registry.set('nextWaveIn', 3);
		this.registry.set('money', 100);
		this.registry.set('playerHealth', 50);
		this.registry.set('statusText', '-- paused--');
		this.registry.set('map', 'map-001');
	}

	public create(): void {
		console.info('BootScene - create()');
		this.scene.start('LoadScene', {});
	}

	public update(time: number, delta: number): void {
		// empty
	}
}
