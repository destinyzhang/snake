import Browser = laya.utils.Browser;

// 程序入口
class GameMain {
    constructor() {
        if (this.debug('canvas', '1'))
            Laya.init(Browser.width, Browser.height, Laya.WebGLCanvas);
        else
            Laya.init(Browser.width, Browser.height, Laya.WebGL);
        if (this.debug('debug', '1'))
            Laya.Stat.show(0, 0);
        Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
        Laya.stage.scaleMode = Laya.Stage.SCALE_FULL;
        Laya.stage.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
        window.onresize = function (this: Window, ev: UIEvent) {
            Laya.stage.size(Browser.width, Browser.height);
        }
        //版本管理
        Laya.ResourceVersion.type = Laya.ResourceVersion.FILENAME_VERSION;
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.beginLoad));
    }

    private debug(paraName: string, value: string): boolean {
        let url = document.location.toString();
        let arrObj = url.split("?");
        if (arrObj.length > 1) {
            var arrPara = arrObj[1].split("&");
            var arr;

            for (var i = 0; i < arrPara.length; i++) {
                arr = arrPara[i].split("=");

                if (arr != null && arr[0] == paraName) {
                    return arr[1] == value;
                }
            }
        }
        return false;
    }

    private beginLoad(): void {
        Laya.loader.load(['res/atlas/images.atlas', 'map/tile_map.png'], Laya.Handler.create(this, this.init));

    }
    private init(result: any): void {
        Laya.stage.addChild(new view.UIMain());
        Laya.timer.frameLoop(1, this, this.loop);
    }

    private loop(): void {
        view.UIMain.Instance.Loop();
    }
}
new GameMain();