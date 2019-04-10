import { Tower } from './Tower';
import { GameScene } from '../scenes/GameScene';

const baseHealth = 100;
const baseSpeed = 100; // lower is faster
const baseValue = 10;

export enum EnemyType {
	NORMAL,
	SPEEDY,
	HEAVY,
	FLYING,
}

export class Enemy extends Phaser.GameObjects.PathFollower {
	public scene: GameScene;
	public enemyType: EnemyType;
	public health: number;
	public speed: number;
	public value: number;

	constructor(scene: GameScene, path: Phaser.Curves.Path, enemyType: EnemyType) {
		super(scene, path, -100, -100, 'sprite');

		this.scene = scene;
		this.enemyType = enemyType;
		this.setEnemyTypeSettings();

		this.setOrigin(0.5).setVisible(true).setActive(true);

		scene.add.existing(this);
	}

	public start(): void {
		this.setPosition(this.path.getStartPoint().x, this.path.getStartPoint().y);
		this.startFollow({
			from: 0,
			to: 1,
			duration: this.path.getLength() * this.speed * .5,
			rotateToPath: true,
			rotationOffset: 90,
			onStart: function() { this.startPath(); }.bind(this),
			onComplete: function() { this.completePath(); }.bind(this),
		});
	}

	public damage(amount: number, dealtBy?: Tower): void {
		this.health -= amount;
		if (this.health <= 0) {
			if (dealtBy) {
				dealtBy.experience(1);
			}

			this.kill();
		}
	}

	public kill(): void {
		this.scene.sound.play('explosion');
		this.scene.events.emit('enemy:killed');
		this.scene.events.emit('money:gain', this.value);
		this.die();
	}

	public die(): void {
		this.setActive(false).setVisible(false);
		this.scene.activeEnemies.delete(this);
		this.pathTween.stop();
		this.destroy();
	}

	public get progress(): number {
		return this.pathTween.progress;
	}

	// private ------------

	private startPath(): void {
		console.log('creep spawn', this);
	}

	private completePath(): void {
		console.log('creep made it to base', this);
		this.scene.events.emit('base:damage');
		this.die();
	}

	private setEnemyTypeSettings(): void {
		switch (this.enemyType) {
			case EnemyType.SPEEDY:
				this.health = baseHealth * .6;
				this.speed = baseSpeed * 0.5;
				this.value = baseValue * 1.2;
				this.setFrame(4);
				break;

			case EnemyType.HEAVY:
				this.health = baseHealth * 2;
				this.speed = baseSpeed * 1.25;
				this.value = baseValue * 2;
				this.setFrame(7);
				break;

			case EnemyType.FLYING:
				this.health = baseHealth * .6;
				this.speed = baseSpeed * 1;
				this.value = baseValue * 1.5;
				this.setFrame(6);
				break;

			default:
				this.enemyType = EnemyType.NORMAL;
				this.health = baseHealth * 1;
				this.speed = baseSpeed * 1;
				this.value = baseValue * 1;
				this.setFrame(5);
		}
	}
}
