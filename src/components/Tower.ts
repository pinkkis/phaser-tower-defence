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

	public towerType: TowerType;


	constructor(scene: Phaser.Scene, x: number, y: number, towerType: TowerType) {
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.towerType = towerType;

		this.createSprite();
	}

	public createSprite() {
		this.base = this.scene.add.image(this.x, this.y, 'sprite', SpriteFrame.Tower.Base).setOrigin(0.5);
		this.turret = this.scene.add.sprite(this.x, this.y, 'sprite').setOrigin(0.5);

		switch (this.towerType) {
			default:
				this.turret.setFrame(SpriteFrame.Tower.Normal);
		}
	}

	public update() {
		const target = (this.scene as any).enemies.getFirstAlive();
		this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, target.x, target.y);
	}

	public destroy() {
		this.base.destroy();
		this.turret.destroy();
	}
}
// 5, 5
