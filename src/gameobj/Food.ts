/**
* name 
*/
module GameObj {
	export abstract class FoodBase extends GameObjBase {
		private eated: boolean = false;
		public get Eated() { return this.eated; }
		public get GameType() { return GameObjType.Food; }
		public abstract GetValue: number;
		public beEat(who: GameObjBase): void {
			if (this.eated) return;
			this.eated = true;
			if (this.visible)
				Laya.Tween.to(this, { x: who.x, y: who.y }, 100, Laya.Ease.bounceIn, Laya.Handler.create(this, this.destroySelf));
			else
				this.destroySelf();
		}

		protected destroySelf(): void {
			this.removeSelf();
			this.destroy();
		}
	}

	export class Food extends FoodBase {
		private unitIdx: number;
		public get GetValue() { return 1; }
		constructor(uintIdx: number) {
			super();
			this.unitIdx = uintIdx;
			this.zOrder = 10;
			Laya.loader.load(this.getUnitImage(), Laya.Handler.create(this, this.load));
		}
		public get GameType() { return GameObjType.Food; }
		private load(result): void {
			if (result == null || this.Eated) return;
			this.loadImage(this.getUnitImage());
			this.pivot(this.width / 2, this.height / 2);
		}

		private getUnitImage(): string {
			return 'images/' + 'bean' + this.unitIdx + '.png';
		}
	}

	export class BodyFood extends FoodBase {
		public get GetValue() { return 5; }
		public get GameType() { return GameObjType.BodyFood; }
	}
}