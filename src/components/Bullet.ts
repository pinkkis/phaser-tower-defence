import { GameScene } from '../scenes/GameScene';

export class Bullet extends Phaser.GameObjects.Image {
	public scene: GameScene;
	public speed: number;
	public direction: number;
	public xSpeed: number;
	public ySpeed: number;
	public born: number;
	public lifespan: number = 1000;
	public damage: number;

	constructor(scene: GameScene, x: number, y: number, type: number, damage: number) {
		super(scene, x, y, 'sprite8');

		this.scene = scene;

		this.speed = .2;
		this.direction = 0;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.born = 0;

		this.damage = damage;
		this.setFrame(type);

		this.scene.add.existing(this);
		this.setOrigin(.5);
	}

	public calculateDirectionToTarget(target: Vector2Like) {
		this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

		if (target.y >= this.y) {
			this.xSpeed = this.speed * Math.sin(this.direction);
			this.ySpeed = this.speed * Math.cos(this.direction);
		} else {
			this.xSpeed = -this.speed * Math.sin(this.direction);
			this.ySpeed = -this.speed * Math.cos(this.direction);
		}
	}

	public update(time: number, delta: number): void {
		this.x += this.xSpeed * delta;
		this.y += this.ySpeed * delta;
		this.born += delta;
	}

	public get alive(): boolean {
		return this.born < this.lifespan;
	}

}
