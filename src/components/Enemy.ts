const baseHealth = 100;
const baseSpeed = 100;

export enum EnemyType {
	NORMAL,
	FAST,
	HEAVY,
	FLYING,
}

export class Enemy extends Phaser.GameObjects.PathFollower {
	public enemyType: EnemyType;
	public health: number;
	public speed: number;
	public nextWaypoint: Phaser.Math.Vector2;

	constructor(scene: Phaser.Scene, path: Phaser.Curves.Path, enemyType: EnemyType) {
		super(scene, path, -100, -100, 'sprite');

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
			duration: this.path.getLength() * this.speed * .8,
			rotateToPath: true,
			rotationOffset: 90,
		});
	}

	public die(): void {
		this.setActive(false).setVisible(false);
	}

	private setEnemyTypeSettings(): void {
		switch (this.enemyType) {
			case EnemyType.FAST:
				this.health = baseHealth * .6;
				this.speed = baseSpeed * 1.5;
				this.setFrame(4);

			case EnemyType.HEAVY:
				this.health = baseHealth * 2;
				this.speed = baseSpeed * .75;
				this.setFrame(7);

			case EnemyType.FLYING:
				this.health = baseHealth * .6;
				this.speed = baseSpeed * 1;
				this.setFrame(6);

			default:
				this.enemyType = EnemyType.NORMAL;
				this.health = baseHealth * 1;
				this.speed = baseSpeed * 1;
				this.setFrame(5);
		}
	}
}
