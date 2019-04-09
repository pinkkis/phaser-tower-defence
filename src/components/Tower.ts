import { SpriteFrame } from './Sprites';

export enum TowerType {
	NORMAL,
	LASER,
	AIR,
}

export class Tower {
	public scene: Phaser.Scene;
	public x: number;
	public y: number;

	public base: Phaser.GameObjects.Image;
	public turret: Phaser.GameObjects.Sprite;
	public rangeCircleDebug: Phaser.GameObjects.Arc;
	public rangeCircle: Phaser.Geom.Circle;

	public towerType: TowerType;
	public damage: number;
	public range: number;
	public turnSpeed: number;
	public attackSpeed: number;

	public level: number = 1;

	private target: Phaser.GameObjects.GameObject = null;
	private lastFired: number;

	constructor(scene: Phaser.Scene, x: number, y: number, towerType: TowerType) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.towerType = towerType;

		this.createTower();
		this.createSprite();
	}

	public createSprite() {
		this.base = this.scene.add.image(this.x, this.y - 2, 'sprite', SpriteFrame.Tower.Base).setOrigin(0.5).setDepth(50);
		this.turret = this.scene.add.sprite(this.x, this.y - 6, 'sprite').setOrigin(0.5).setDepth(51);
		this.rangeCircleDebug = this.scene.add.circle(this.x, this.y - 4, this.range, 0xff0000, 0.2);

		switch (this.towerType) {
			case TowerType.AIR:
				this.turret.setFrame(SpriteFrame.Tower.Air);
				break;
			case TowerType.LASER:
				this.turret.setFrame(SpriteFrame.Tower.Laser);
				break;
			default:
				this.turret.setFrame(SpriteFrame.Tower.Normal);
		}
	}

	public update(time: number, delta: number) {
		// const target = (this.scene as any).enemies.getFirstAlive();
		// this.turret.rotation = Phaser.Math.Angle.BetweenPoints(this.turret, target) + Phaser.Math.DEG_TO_RAD * 90;
	}

	public destroy() {
		this.base.destroy();
		this.turret.destroy();
	}

	private createTower() {
		switch (this.towerType) {
			case TowerType.AIR:
				this.damage = 10;
				this.range = 100;
				this.turnSpeed = 10;
				this.attackSpeed = 200;
				break;
			case TowerType.LASER:
				this.damage = 10;
				this.range = 80;
				this.turnSpeed = 10;
				this.attackSpeed = 200;
				this.damage = 10;
				break;
			default:
				this.damage = 10;
				this.range = 50;
				this.turnSpeed = 15;
				this.attackSpeed = 300;
		}

		this.rangeCircle = new Phaser.Geom.Circle(this.x, this.y - 4, this.range);
	}

	private getTarget() {
		//
	}
}
// 5, 5
