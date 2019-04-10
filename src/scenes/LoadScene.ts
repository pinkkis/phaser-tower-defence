import { BaseScene } from './BaseScene';

export class LoadScene extends BaseScene {
	private rt: Phaser.GameObjects.RenderTexture;

	constructor(key: string, options: any) {
		super('LoadScene');
	}

	public preload(): void {
		const progress = this.add.graphics();

		this.load.on('progress', (value: number) => {
			progress.clear();
			progress.fillStyle(0xffffff, 1);
			progress.fillRect(
				0,
				this.scale.gameSize.height / 2,
				this.scale.gameSize.width * value,
				60,
			);
		});

		this.load.on('complete', () => {
			progress.destroy();
		});

		this.load.image('tiles', './assets/tiles-e.png');
		this.load.spritesheet('coin', './assets/coin.png', { frameHeight: 8, frameWidth: 8 } );
		this.load.spritesheet('sprite', './assets/sprites.png', { frameHeight: 16, frameWidth: 16 });
		this.load.spritesheet('sprite8', './assets/sprites-8.png', { frameHeight: 8, frameWidth: 8 });
		this.load.tilemapTiledJSON('map-001', './assets/maps/map-001.json');

		this.load.audio('explosion', './assets/sound/explosion.wav');
		this.load.audio('gameover', './assets/sound/gameover.wav');
		this.load.audio('laser', './assets/sound/laser.wav');
		this.load.audio('lose-health', './assets/sound/lose-health.wav');
		this.load.audio('menu-select', './assets/sound/menu-select.wav');
		this.load.audio('plip', './assets/sound/plip.wav');
		this.load.audio('thukk', './assets/sound/thukk.wav');
		this.load.audio('wave-start', './assets/sound/wave-start.wav');
	}

	public create(): void {

		this.createFrames();

		this.scene.start('GameScene', {});
	}

	private createFrames(): void {
		this.anims.create({
			key: 'spin',
			frames: this.anims.generateFrameNumbers('coin', {
				frames: [0, 1, 3, 2, 1, 0, 6, 5, 4, 5, 6],
			}),
			frameRate: 10,
			repeat: -1,
		});
	}

}
