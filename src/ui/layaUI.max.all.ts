
import View=laya.ui.View;
import Dialog=laya.ui.Dialog;
module ui {
    export class UIMainUI extends View {
		public img_map:Laya.Image;
		public img_ctlbg:Laya.Image;
		public img_ctl_flg:Laya.Image;
		public btn_speed:Laya.Button;

        public static  uiView:any ={"type":"View","props":{"y":0,"x":0,"width":600,"top":1,"right":1,"pivotY":0,"pivotX":0,"left":1,"height":400,"bottom":1},"child":[{"type":"Image","props":{"y":200,"x":300,"var":"img_map","skin":"map/tile_map.png","pivotY":750,"pivotX":1500}},{"type":"Image","props":{"var":"img_ctlbg","skin":"images/control-back.png","pivotY":40,"pivotX":40,"left":40,"bottom":40},"child":[{"type":"Image","props":{"y":40,"x":40,"var":"img_ctl_flg","skin":"images/control-rocker.png","pivotY":17.5,"pivotX":17.5}}]},{"type":"Button","props":{"y":320,"x":520,"var":"btn_speed","stateNum":2,"skin":"images/control-flash.png","right":40,"pivotY":40,"pivotX":40,"bottom":40}}]};
        constructor(){ super()}
        createChildren():void {
        
            super.createChildren();
            this.createView(ui.UIMainUI.uiView);

        }

    }
}
