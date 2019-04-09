import { SpriteFrame } from './Sprites';
import { Enemy } from './Enemy';
import { GameScene } from '../scenes/GameScene';

export enum TowerType {
	NORMAL,
	LASER,
	AIR,
}

export class Tower {
	public scene: GameScene;
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

	private target: Enemy = null;
	private lastFired: number = 0;

	constructor(scene: GameScene, x: number, y: number, towerType: TowerType) {
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

		this.target = this.getTarget();

		if (this.target) {
			if (this.targetInSight && this.canFire(time)) {
				console.log('fire');
				this.turnTowardsTarget(delta);
				this.fire(time);
			} else if (!this.targetInSight) {
				this.turnTowardsTarget(delta);
			}
		}
	}

	public destroy() {
		this.base.destroy();
		this.turret.destroy();
		this.rangeCircleDebug.destroy();
		this.rangeCircle = null;
		this.target = null;
	}

	// private ------------

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

	private turnTowardsTarget(delta: number): void {
		const targetAngle = Phaser.Math.Angle.BetweenPoints(this.turret, this.target) + Phaser.Math.DEG_TO_RAD * 90;
		this.turret.rotation = Phaser.Math.Angle.RotateTo(this.turret.rotation, targetAngle, 0.001 * this.turnSpeed);
	}

	private fire(time: number): void {
		this.lastFired = time;
		// actually fire
	}

	private get targetInSight(): boolean {
		if (!this.target) { return false; }

		const angleDiff = Math.abs(this.turret.rotation - (Phaser.Math.Angle.BetweenPoints(this.turret, this.target) + Phaser.Math.DEG_TO_RAD * 90) );

		return angleDiff < 0.1;
	}

	private canFire(time: number): boolean {
		return this.lastFired + this.attackSpeed <= time;
	}

	private getTarget(): Enemy {
		let target: Enemy = null;

		this.scene.enemies.forEach( (enemy: Enemy) => {
			if (this.rangeCircle.contains(enemy.x, enemy.y)) {
				if (target) {
					if (enemy.progress > target.progress) {
						target = enemy;
					}
				} else {
					target = enemy;
				}
			}
		});

		return target;
	}
}

