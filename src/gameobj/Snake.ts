/**
* name 
*/
module GameObj {
	class WayPath {
		public x: number;
		public y: number;
		public rotation: number;
		constructor(x: number, y: number, rotation: number) {
			this.x = x;
			this.y = y;
			this.rotation = rotation;
		}
	}

	export class Snake extends GameObjBase {
		private unitIdx: number = Math.floor(Math.random() * 5 + 1);
		private speed: number = 2;
		private sscale: number = 0.6;
		private pathList: Array<WayPath> = new Array<WayPath>();
		private bodyList: Array<BodyFood> = new Array<BodyFood>();
		private unitSpace: number = 20;
		private initBodyNum: number = 5;
		private eatFoodNum: number = 0;
		private level: number = 1;
		private nextLvNeedFood: number = 10;
		private dead: boolean = false;
		private readonly maxScale: number = 0.9;
		constructor(zorder: number) {
			super();
			this.visible = false;
			this.zOrder = zorder;
			Laya.loader.load([this.getUnitImage(true), this.getUnitImage(false)], Laya.Handler.create(this, this.load));
		}

		public ChangeSpeed(speed: number): void {
			this.speed = speed;
		}

		public get GameType() { return GameObjType.Snake; }

		public get Alive() { return !this.dead; }

		private aiVector: Laya.Point;
		private aiRotation: number;
		private aiTarget: GameObj.FoodBase = null;
		private aiSearch: number = 1000;
		//随便写一个
		private setAiTarget(): void {
			this.aiTarget = view.UIMain.Instance.FindFood(new Laya.Rectangle(this.x - this.aiSearch / 2, this.y - this.aiSearch / 2, this.aiSearch, this.aiSearch));
			if (this.aiTarget == null) return;
			this.aiVector = new Laya.Point(this.aiTarget.x - this.x, this.aiTarget.y - this.y);
			this.aiVector.normalize();
			this.aiRotation = Math.atan2(this.aiVector.y, this.aiVector.x) * 180 / Math.PI;
		}

		public CheckCollide(snake: Snake): boolean {
			let safeDis = (this.getBounds().width + snake.getBounds().width) / 2 - 5;
			for (let i = 0; i < this.bodyList.length; ++i) {
				let body = this.bodyList[i];
				let dis = body.distance(snake.x, snake.y);
				if (dis <= safeDis)
					return true;
			}
			return false;
		}

		public AiLoop(): void {
			if (this.aiTarget == null || this.aiTarget.Eated)
				this.setAiTarget();
			if (this.aiTarget != null)
				this.Loop(this.aiVector, this.aiRotation);
		}

		public checkVisible(): void {
			this.visible = view.UIMain.Instance.checkInViewPort(this.x, this.y);
			this.bodyList.forEach(body => {
				body.visible = view.UIMain.Instance.checkInViewPort(body.x, body.y);
			});
		}

		private checkLevelUp(): void {
			if (this.eatFoodNum >= this.nextLvNeedFood) {
				++this.level;
				this.nextLvNeedFood = 10 + this.level * 5;
				this.eatFoodNum = 0;
				this.addBody(false);
				if (this.sscale < this.maxScale && this.level % 5 == 0) {
					this.sscale += this.level * 0.02;
					if (this.sscale >= this.maxScale)
						this.sscale = this.maxScale;
					this.changeScale();
				}
			}
		}

		private changeScale(): void {
			this.scale(this.sscale, this.sscale, true);
			this.bodyList.forEach(body => {
				body.scale(this.sscale, this.sscale, true);
			});
			this.unitSpace = Math.floor(this.getBounds().width * 0.68);
		}

		public IncEatFoodNum(num: number): void {
			if (this.level >= 500) return;
			this.eatFoodNum += num;
		}

		public Loop(vector: Laya.Point, rotation: number): void {
			if (this.dead) return;
			if (vector.x == 0 && vector.y == 0) return;
			if (this.move(vector, rotation)) {
				this.moveBody();
				this.checkLevelUp();
			} else
				this.Dead();
		}

		private move(vector: Laya.Point, rotation: number): boolean {
			this.rotation = rotation;
			for (let i = 0; i < this.speed; ++i) {
				this.x += vector.x;
				this.y += vector.y;
				if (this.checkOutBounds())
					return false;
				else
					this.pathList.unshift(new WayPath(this.x, this.y, rotation));
			}
			return true;
		}

		private moveBody() {
			for (let i = 0; i < this.bodyList.length; ++i) {
				let body = this.bodyList[i];
				let path = this.pathList[(i + 1) * this.unitSpace]
				if (path) {
					body.rotation = path.rotation;
					body.x = path.x;
					body.y = path.y;
					body.visible = true;
				}
			}

			if (this.pathList.length > this.bodyList.length * this.unitSpace)
				this.pathList = this.pathList.slice(0, this.bodyList.length * this.unitSpace);
		}

		private checkOutBounds(): boolean {
			//不能出界
			if (this.x + this.getBounds().width / 2 > this.curMap.width) {
				this.x = this.curMap.width - this.getBounds().width / 2;
				return true;
			}
			else if (this.x < this.getBounds().width / 2) {
				this.x = this.getBounds().width / 2;
				return true;
			}
			if (this.y + this.getBounds().height / 2 > this.curMap.height) {
				this.y = this.curMap.height - this.getBounds().height / 2;
				return true;
			}
			else if (this.y < this.getBounds().height / 2) {
				this.y = this.getBounds().height / 2;
				return true;
			}
			return false;
		}

		private addBody(visible: boolean = true): void {
			let fontWidget = this.bodyList.length == 0 ? this : this.bodyList[this.bodyList.length - 1];
			let body = new BodyFood();
			body.zOrder = fontWidget.zOrder;
			body.loadImage(this.getUnitImage(false));
			body.scale(this.sscale, this.sscale, true);
			body.pivot(body.width / 2, body.height / 2);

			let offx = Math.cos(fontWidget.rotation * Math.PI / 180);
			let offy = Math.sin(fontWidget.rotation * Math.PI / 180);

			body.visible = visible;
			body.pos(fontWidget.x - this.unitSpace * offx, fontWidget.y + this.unitSpace * offy);
			this.bodyList.push(body);
			this.curMap.addChild(body);
		}

		private load(result): void {
			if (result && !this.dead) {
				this.visible = true;
				this.loadImage(this.getUnitImage(true));
				this.pivot(this.width / 2, this.height / 2);
				this.scale(this.sscale, this.sscale, true);
				for (let i = 0; i < this.initBodyNum; ++i)
					this.addBody();
				for (let i = 0; i < this.initBodyNum * this.unitSpace; ++i)
					this.pathList.push(new WayPath(this.x - i, this.y, this.rotation));
			}
		}

		private getUnitImage(head: boolean): string {
			return 'images/' + (head ? 'head' : 'body') + this.unitIdx + '.png';
		}

		public Dead(): void {
			if (this.dead) return;
			this.dead = true;
			view.UIMain.Instance.AddBodyFood(this.bodyList);
			this.removeSelf();
			this.destroy();
		}
	}
}