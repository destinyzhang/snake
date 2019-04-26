/**
* name 
*/
module GameObj {
	export enum GameObjType {
		Snake,
		Food,
		BodyFood,
		Bomb,
	}

	export abstract class GameObjBase extends Laya.Sprite {
		private static disPoint = new Laya.Point();
		protected curMap: Laya.Image;
		public abstract GameType: GameObjType;

		public getRandomPos(min: number, max: number): number {
			return min + Math.random() * (max - min);
		}

		public setMap(map: Laya.Image): void {
			this.curMap = map;
			this.curMap.addChild(this);
		}
		constructor() {
			super();
		}

		public distance(x: number, y: number): number {
			return GameObjBase.disPoint.setTo(this.x, this.y).distance(x, y);
		}
	}
}