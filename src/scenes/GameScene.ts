import { BaseScene } from './BaseScene';
import { Enemy, EnemyType } from '../components/Enemy';
import { Input } from 'phaser';
import { Tower, TowerType } from '../components/Tower';
import { Wave, waveParser } from '../components/Wave';
import { SpriteFrame, Sprite8Frame } from '../components/Sprites';
import { Colors } from '../components/Colors';
import { Bullet } from '../components/Bullet';

interface ITiledPolyline extends Phaser.GameObjects.GameObject {
	x: number;
	y: number;
	polyline: Phaser.Math.Vector2[];
}

interface ITiledGameTile extends Phaser.Tilemaps.Tile {
	properties: {
		buildable: boolean;
		walkable: boolean;
		collides: boolean;
	};
}

interface ITiledMap extends Phaser.Tilemaps.Tilemap {
	properties: any[];
}

export class GameScene extends BaseScene {
	public activeEnemies: Set<Enemy>;
	public towerTile: Map<string, Tower>;
	public bullets: Set<Bullet>;

	public map: ITiledMap;
	public tileset: Phaser.Tilemaps.Tileset;

	public waves: Wave[];
	public creepPath: Phaser.Curves.Path;

	public uiContainer: Phaser.GameObjects.Container;

	private scrollZoneLeft: Phaser.Geom.Rectangle;
	private scrollZoneRight: Phaser.Geom.Rectangle;
	private scrollZoneUp: Phaser.Geom.Rectangle;
	private scrollZoneDown: Phaser.Geom.Rectangle;

	private ui: any = {};

	private timer: Phaser.Tweens.Tween;

	constructor(key: string, options: any) {
		super('GameScene');
	}

	public preload(): void {
		// empty
	}

	public init(): void {
		// empty
	}

	public create(): void {
		console.info('GameScene - create()');

		const levelTopMargin = 20;

		this.activeEnemies = new Set<Enemy>();
		this.towerTile = new Map<string, Tower>();
		this.bullets = new Set<Bullet>();

		this.map = this.make.tilemap({ key: 'map-001' }) as ITiledMap;
		this.tileset = this.map.addTilesetImage('tiles', 'tiles');
		this.map.createStaticLayer('bg', this.tileset, 0, 0).setDepth(0);
		this.map.createStaticLayer('top', this.tileset, 0, 0).setDepth(10);

		// create creeppath
		const creepPathObject = this.map.findObject('objects', (sp: Phaser.GameObjects.GameObject) => sp.type === 'CREEP_PATH') as ITiledPolyline;
		this.creepPath = this.createCreepPath(creepPathObject);

		// load waves
		this.waves = [];
		this.map.properties.forEach( (p: any) => {
			if (p.name === 'waves') {
				p.value.split('\n').forEach( (line: string) => {
					this.waves.push(waveParser(line));
				});
			}
		});

		// click to add tower
		this.input.on(Input.Events.POINTER_DOWN, (pointer: Input.Pointer) => {
			const worldPoint = pointer.positionToCamera(this.cameras.main) as Vector2Like;
			const tile = this.map.getTileAtWorldXY(worldPoint.x, worldPoint.y) as ITiledGameTile;

			if (tile && tile.properties.buildable) {
				if (!this.towerTile.has(`${tile.x}|${tile.y}`)) {
					const tower = this.createTower(tile, TowerType.NORMAL);
					this.towerTile.set(`${tile.x}|${tile.y}`, tower);
					this.sound.play('plip');
				}
			}
		});

		// create UI
		this.createUI();

		// setup camera
		this.cameras.main.scrollY -= levelTopMargin;
		this.cameras.main.setBounds(0, -levelTopMargin, this.map.widthInPixels, this.map.heightInPixels + levelTopMargin);

		// create camera scroll
		const zoneSize = 20;
		this.scrollZoneLeft = new Phaser.Geom.Rectangle(0, levelTopMargin, zoneSize, this.scale.gameSize.height);
		this.scrollZoneUp = new Phaser.Geom.Rectangle(0, levelTopMargin, this.scale.gameSize.width, zoneSize);
		this.scrollZoneRight = new Phaser.Geom.Rectangle(this.scale.gameSize.width - zoneSize, levelTopMargin, zoneSize, this.scale.gameSize.height);
		this.scrollZoneDown = new Phaser.Geom.Rectangle(0, this.scale.gameSize.height - zoneSize, this.scale.gameSize.width, zoneSize);

		// setup events
		this.setupEvents();
	}

	public update(time: number, delta: number): void {
		const pointerPos = this.input.activePointer.position;

		if (this.scrollZoneDown.contains(pointerPos.x, pointerPos.y))  { this.cameras.main.scrollY += 1; }
		if (this.scrollZoneRight.contains(pointerPos.x, pointerPos.y)) { this.cameras.main.scrollX += 1; }
		if (this.scrollZoneUp.contains(pointerPos.x, pointerPos.y))    { this.cameras.main.scrollY -= 1; }
		if (this.scrollZoneLeft.contains(pointerPos.x, pointerPos.y))  { this.cameras.main.scrollX -= 1; }

		this.towerTile.forEach( (tower: Tower) => {
			tower.update(time, delta);
		});

		this.bullets.forEach( (bullet: Bullet) => {
			const target: Enemy = bullet.getData('target');
			const rect = target.getBounds();

			if (target.active && rect.contains(bullet.x, bullet.y)) {
				target.damage(bullet.damage, bullet.getData('owner'));
				this.bullets.delete(bullet);
				bullet.destroy();
			} else {
				if (target.active) {
					bullet.calculateDirectionToTarget(target);
				}
				bullet.update(time, delta);
			}

			if (!bullet.alive) {
				this.bullets.delete(bullet);
				bullet.destroy();
			}
		});
	}

	public startWave(waveIndex?: number): void {
		waveIndex = waveIndex || this.registry.get('wave') - 1;

		if (waveIndex >= this.waves.length) { return; }

		const waveEnemies = this.createWaveEnemies(this.waves[waveIndex]);

		waveEnemies.forEach( (e: Enemy, index: number) => {
			this.activeEnemies.add(e);
			setTimeout(() => e.start(), index * 2000);
		});

		this.sound.play('wave-start');
	}

	public clean(): void {
		this.registry.events.off('changedata');
		this.ui.waveButton.off();
	}

	// private methods ------------

	private setupEvents(): void {
		this.timer = this.tweens.addCounter({
			from: 0,
			to: 100,
			duration: 1000,
			repeat: -1,
			onRepeat: () => this.events.emit('timerloop'),
		}).pause();

		this.events
			.on('timerloop', () => {
				console.log('timer loop');
				const nextWave = this.registry.get('nextWaveIn') - 1;

				if (nextWave < 0) {
					this.registry.set('wave', 1 + this.registry.get('wave'));
					this.registry.set('nextWaveIn', 30);
					this.startWave();
				} else {
					this.registry.set('nextWaveIn', nextWave);
				}
			}, this)
			.on('pause', () => {
				console.log('pause');
				this.registry.set('statusText', '-- paused --');
				this.timer.complete();
			}, this)
			.on('unpause', () => {
				console.log('resume');
				this.registry.set('statusText', 'wave incoming');
				this.registry.set('nextWaveIn', 3);
				this.timer.restart();
			}, this)
			.on('money:gain', (amt: number) => this.registry.set('money', amt + this.registry.get('money')), this)
			.on('enemy:killed', () => {}, this)
			.on('base:damage', () => {
				this.registry.set('playerHealth', this.registry.get('playerHealth') - 1 );
				this.sound.play('lose-health');
			}, this);
	}

	private createWaveEnemies(wave: Wave): Enemy[] {
		const enemies: Enemy[] = [];
		wave.creeps.forEach( (et: EnemyType) => {
			const enemy = new Enemy(this, this.creepPath, et);
			enemies.push(enemy);
		});

		return enemies;
	}

	private createCreepPath(creepPathObject: ITiledPolyline): Phaser.Curves.Path {
		const creepPath = new Phaser.Curves.Path(creepPathObject.x + creepPathObject.polyline[0].x, creepPathObject.y + creepPathObject.polyline[0].y);
		for (let i = 1; i < creepPathObject.polyline.length; i++) {
			creepPath.lineTo(creepPathObject.x + creepPathObject.polyline[i].x, creepPathObject.y + creepPathObject.polyline[i].y);
		}

		return creepPath;
	}

	private createTower(tile: Phaser.Tilemaps.Tile, towerType: TowerType): Tower {
		if (!tile) { return; }
		const tower = new Tower(this, tile.getCenterX(), tile.getCenterY(), towerType);
		return tower;
	}

	private createUI(): void {
		this.ui.bg = this.add.rectangle(0, 0, this.scale.gameSize.width, 20, 0x333333, 1).setOrigin(0);
		this.ui.coin = this.add.sprite(2, 1, 'coin', 3).setOrigin(0).play('spin');
		this.ui.waveButton = this.add.sprite(142, 2, 'sprite', SpriteFrame.Ui.StartWave).setOrigin(0).setData('paused', true);
		this.ui.health = this.add.sprite(2, 11, 'sprite8', Sprite8Frame.Ui.Heart).setOrigin(0);
		this.ui.textHealth = this.add.bitmapText(10, 11, 'silk', this.registry.get('playerHealth')).setTint(Colors.WHITE);
		this.ui.textStatus = this.add.bitmapText(32, 11, 'silk', this.registry.get('statusText')).setOrigin(0).setTint(Colors.WHITE);
		this.ui.textMoney = this.add.bitmapText(10, 1, 'silk', this.registry.get('money'), 8).setDepth(20).setOrigin(0).setTint(Colors.WHITE);
		this.ui.textWave = this.add.bitmapText(42, 1, 'silk', `Wave: ${this.registry.get('wave')}`).setTint(Colors.WHITE);
		this.ui.textNext = this.add.bitmapText(95, 1, 'silk', `Next: ${this.registry.get('nextWaveIn')}`).setTint(Colors.WHITE);

		[this.ui.bg, this.ui.coin, this.ui.textMoney,
			this.ui.waveButton, this.ui.textWave, this.ui.textNext,
			this.ui.health, this.ui.textHealth, this.ui.textStatus]
			.forEach( (x: any) => {
				x.setDepth(100);
				x.setScrollFactor(0);
			});

		// events
		this.ui.waveButton
			.setInteractive({cursor: 'pointer'})
			.on(Input.Events.GAMEOBJECT_POINTER_DOWN, (pointer: Input.Pointer, x: number, y: number, event: Input.EventData) => {
				event.stopPropagation();
				if (this.ui.waveButton.getData('paused')) {
					this.events.emit('unpause');
					this.ui.waveButton.setData('paused', false).setFrame(SpriteFrame.Ui.PauseWave);
				} else {
					this.events.emit('pause');
					this.ui.waveButton.setData('paused', true).setFrame(SpriteFrame.Ui.StartWave);
				}
			});

		this.registry.events.on('changedata', (parent: any, key: string, data: any) => {
			switch (key) {
				case 'wave':
					this.ui.textWave.setText(`Wave: ${data}`);
					break;

				case 'playerHealth':
					this.ui.textHealth.setText(`${data}`);
					break;

				case 'money':
					this.ui.textMoney.setText(`${data}`);
					break;

				case 'nextWaveIn':
					this.ui.textNext.setText(`Next: ${data}`);
					break;

				case 'statusText':
					this.ui.textStatus.setText(`${data}`);
					break;
			}
		});

	}
}
