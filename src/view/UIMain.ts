/**Created by the LayaAirIDE*/
module view {
	export class UIMain extends ui.UIMainUI {
		private ctlFlagPoint: Laya.Point = new Laya.Point();
		private curVector: Laya.Point = new Laya.Point();
		private curRotation: number = 0;
		private maxDis: number = 0;
		private selfSnake: GameObj.Snake;
		private aiSnakeList: Array<GameObj.Snake> = new Array<GameObj.Snake>();
		private foodList: Array<GameObj.FoodBase> = new Array<GameObj.FoodBase>();
		private readonly maxFoodNum: number = 1500;
		private readonly maxAiSnake: number = 20;
		private static instance: UIMain = null
		public static get Instance() { return UIMain.instance; }
		constructor() {
			super();
			this.ctlFlagPoint.x = this.img_ctl_flg.x;
			this.ctlFlagPoint.y = this.img_ctl_flg.y;
			this.maxDis = (this.img_ctlbg.width - this.img_ctl_flg.width) / 2;
			this.on(Laya.Event.MOUSE_MOVE, this, this.onMouseMove);
			this.on(Laya.Event.RESIZE, this, this.onResize);
			this.on(Laya.Event.MOUSE_DOWN, this, this.onMousDown)
			this.btn_speed.on(Laya.Event.MOUSE_DOWN, this, this.onSpeedUp)
			this.btn_speed.on(Laya.Event.MOUSE_UP, this, this.onSpeedDown)
			this.btn_speed.on(Laya.Event.MOUSE_OUT, this, this.onSpeedDown)
			this.addSelfSnake(true);
			this.addRandomFood(this.maxFoodNum / 2);
			this.addRandomAiSnake(this.maxAiSnake / 2);
			UIMain.instance = this;
		}

		public Loop(): void {
			this.updataSelfSnake();
			this.updataViewRec();
			this.aiSnakeLoop();
			this.updateSnakeCollide();
			this.checkEat();
			this.addFood();
			this.addSnake();
		}

		private updateSnakeCollide(): void {
			for (let i = 0; i < this.aiSnakeList.length; i++) {
				let aiSnake = this.aiSnakeList[i];
				if (aiSnake.CheckCollide(this.selfSnake)) {
					this.selfSnake.Dead();
					this.reliveSelfSnake();
					break;
				}
			}

			for (let i = 0; i < this.aiSnakeList.length;) {
				let aiSnake = this.aiSnakeList[i];
				if (this.selfSnake.CheckCollide(aiSnake)) {
					aiSnake.Dead();
					this.aiSnakeList.splice(i, 1);
					continue;
				}

				for (let j = 0; j < this.aiSnakeList.length; j++) {
					if (j == i) continue;
					let othSnake = this.aiSnakeList[j];
					if (othSnake.CheckCollide(aiSnake)) {
						aiSnake.Dead();
						this.aiSnakeList.splice(i, 1);
						break;
					}
				}

				if (aiSnake.Alive)++i;
			}
		}

		private reliveSelfSnake(): void {
			if (!this.selfSnake.Alive)
				this.addSelfSnake(false);
		}

		private updataSelfSnake(): void {
			this.selfSnake.Loop(this.curVector, this.curRotation);
			this.reliveSelfSnake();
		}

		private updataViewRec(): void {
			this.img_map.pivot(this.selfSnake.x, this.selfSnake.y);
			this.viewRec.setTo(this.selfSnake.x - Laya.stage.width / 2, this.selfSnake.y - Laya.stage.height / 2, Laya.stage.width, Laya.stage.height);
		}

		public addSnake(): void {
			if (Laya.timer.currFrame % 500 == 0)
				if (this.aiSnakeList.length < this.maxAiSnake)
					this.addRandomAiSnake(1);
		}

		public addFood(): void {
			if (Laya.timer.currFrame % 5 == 0)
				if (this.foodList.length < this.maxFoodNum)
					this.addRandomFood(1);
		}

		private viewRec: Laya.Rectangle = new Laya.Rectangle();
		public checkInViewPort(x: number, y: number): boolean {
			return this.viewRec.contains(x, y);
		}

		private aiSnakeLoop(): void {
			for (let i = 0; i < this.aiSnakeList.length;) {
				let snake = this.aiSnakeList[i];
				snake.AiLoop();
				if (!snake.Alive) {
					snake.removeSelf();
					snake.destroy();
					this.aiSnakeList.splice(i, 1);
					continue;
				}
				snake.checkVisible();
				++i;
			}
		}
		private foodRec: Laya.Rectangle = new Laya.Rectangle();
		public FindFood(foodRec: Laya.Rectangle): GameObj.FoodBase {
			let targets: Array<GameObj.FoodBase> = [];
			for (let i = 0; i < this.foodList.length; ++i) {
				let food = this.foodList[i];
				if (foodRec.contains(food.x, food.y)) {
					targets.push(food);
				}
			}
			if (targets.length == 0) return null;
			let idx = Math.floor(Math.random() * targets.length);
			if (idx >= targets.length)
				idx = targets.length - 1;
			return targets[idx];
		}

		private checkEat(): void {
			for (let i = 0; i < this.foodList.length;) {
				let food = this.foodList[i];
				let dis = this.selfSnake.distance(food.x, food.y);
				if (dis < this.selfSnake.width) {
					this.selfSnake.IncEatFoodNum(food.GetValue);
					this.foodList.splice(i, 1);
					food.beEat(this.selfSnake);
					continue;
				}
				food.visible = this.checkInViewPort(food.x, food.y);
				let eated = false;
				//所有AI蛇
				for (let j = 0; j < this.aiSnakeList.length; ++j) {
					let snake = this.aiSnakeList[j];
					let dis = snake.distance(food.x, food.y);
					if (dis < snake.width) {
						snake.IncEatFoodNum(food.GetValue);
						this.foodList.splice(i, 1);
						food.beEat(snake);
						eated = true;
						break;
					}
				}
				if (!eated)++i;
			}
		}


		private addRandomAiSnake(num: number): void {
			for (let i = 0; i < num; ++i) {
				let snake = new GameObj.Snake(8888);
				this.AddGameObj(snake, snake.getRandomPos(100, this.img_map.width - 100), snake.getRandomPos(100, this.img_map.height - 100));
				this.aiSnakeList.push(snake);
			}
		}

		private addRandomFood(num: number): void {
			for (let i = 0; i < num; ++i) {
				let food = new GameObj.Food((this.foodList.length + i) % 6 + 1);
				this.AddGameObj(food, food.getRandomPos(5, this.img_map.width - 5), food.getRandomPos(5, this.img_map.height - 5));
				this.foodList.push(food);
			}
		}

		public AddBodyFood(bodyFood: Array<GameObj.BodyFood>): void {
			bodyFood.forEach(body => {
				body.pos(body.getRandomPos(body.x - 3, body.x + 3), body.getRandomPos(body.y - 3, body.y + 3));
			});
			this.foodList.push(...bodyFood);
		}

		private addSelfSnake(init: boolean): void {
			this.selfSnake = new GameObj.Snake(9999);
			if (init)
				this.AddGameObj(this.selfSnake, this.img_map.width / 2, this.img_map.height / 2);
			else
				this.AddGameObj(this.selfSnake, this.selfSnake.getRandomPos(5, this.img_map.width - 5), this.selfSnake.getRandomPos(5, this.img_map.height - 5));
		}

		public AddGameObj(obj: GameObj.GameObjBase, x: number, y: number): void {
			obj.pos(x, y);
			obj.setMap(this.img_map);
		}

		private onResize(): void {
			this.img_map.pos(this.width / 2, this.height / 2);
		}

		private onSpeedUp(): void {
			this.selfSnake.ChangeSpeed(4);
		}

		private onSpeedDown(): void {
			this.selfSnake.ChangeSpeed(2);
		}

		
		private onMousDown(): void {
			if (this.mouseX < Laya.stage.width / 2)
				this.img_ctlbg.pos(this.mouseX, this.mouseY);
			else
				this.btn_speed.pos(this.mouseX, this.mouseY)
		}

		private onMouseMove(): void {
			let v2 = new Laya.Point(this.mouseX - this.img_ctlbg.x, this.mouseY - this.img_ctlbg.y);
			v2.normalize();
			let dis = new Laya.Point(this.mouseX, this.mouseY).distance(this.img_ctlbg.x, this.img_ctlbg.y);
			if (dis > this.maxDis) dis = this.maxDis;
			this.img_ctl_flg.pos(this.ctlFlagPoint.x + v2.x * dis, this.ctlFlagPoint.y + v2.y * dis);
			this.curVector = v2;
			this.curRotation = Math.atan2(v2.y, v2.x) * 180 / Math.PI;
		}
	}
}