"ui";

// 列表宽高
var top, centerX, bottom;
const saveDuanYvFolder = "手心个性短语";

// 打开个性短语界面
function openGeXingDuanYvActivity() {
  app.startActivity({
    packageName: "com.xinshuru.inputmethod",
    className: "com.xinshuru.inputmethod.FTInputSettingsActivity",
  });

  className("android.widget.TextView").text("我").findOne().click();

  className("android.widget.TextView").text("设置").findOne().parent().click();

  id("i").className("android.widget.TextView").text("短语设置").findOne().parent().parent().parent().click();

  className("android.widget.TextView").text("默认个性短语").findOne().parent().click();
}

// 获取当前时间
function getFormattedCurrentTimeNoPadStart(format) {
  let now = new Date();
  let year = now.getFullYear();
  let month = ("0" + (now.getMonth() + 1)).slice(-2); // 月份补零
  let day = ("0" + now.getDate()).slice(-2); // 日期补零
  let hours = ("0" + now.getHours()).slice(-2); // 小时补零
  let minutes = ("0" + now.getMinutes()).slice(-2); // 分钟补零
  let seconds = ("0" + now.getSeconds()).slice(-2); // 秒补零

  return format.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("HH", hours).replace("mm", minutes).replace("ss", seconds);
}

// 去重集合 array原始数组  newElement新加入的元素
function addAndDeduplicate(array, newElement) {
  array.push(newElement);
  // return Array.from(new Set(array));
  return array.filter((v, i, a) => a.indexOf(v) === i);
}

// 爬取个性短语
function task() {
  let listview = id("i").className("android.widget.ListView").findOne();
  if (listview.childCount() === 0) {
    toastLog("没有短语");
    exit();
  }

  const listViewBounds = listview.bounds();
  top = listViewBounds.top;
  centerX = listViewBounds.centerX();
  bottom = listViewBounds.bottom - 10;
  log("获取列表宽高: ", top, bottom, centerX);

  const startTime = new Date();

  let tempText;
  let array = [];

  // 使用循环来反复执行滑动操作
  while (true) {
    // ListView
    listview = id("i").className("android.widget.ListView").findOne();

    // ListView-->LinearLayout集合
    for (let i = 0; i < listview.childCount(); i++) {
      // TextView
      let textView = listview.child(i).child(0);

      if (!!textView) {
        let text = textView.text();
        log(text);

        array = addAndDeduplicate(array, text);

        if (i === 0) {
          tempText = textView.text();
        }
      }
    }

    swipe(centerX, bottom, centerX, top, 200);

    let listviewChild = listview.child(0);
    if (!!listviewChild) {
      if (listviewChild.child(0).text() === tempText) {
        let saveFilePath = files.join(files.getSdcardPath() + "/" + saveDuanYvFolder, "个性短语-" + getFormattedCurrentTimeNoPadStart("yyyy年MM月dd日HH时mm分ss秒") + ".txt");

        files.createWithDirs(saveFilePath);
        files.write(saveFilePath, array.join("\n"));

        log("\n----------处理完成----------");
        toastLog("耗时" + (new Date() - startTime) + "ms");
        toastLog("共" + array.length + "条数据");
        toastLog("保存地址: " + saveFilePath);

        exit();
      }
    }
  }
}

// 开始
function startScript() {
  auto();

  openConsole();

  openGeXingDuanYvActivity();

  if (confirm("是否开始爬取个性短语?", "注意: 运行过程中不要触碰屏幕, 等待脚本运行完毕, 否则可能爬取不完整")) {
    task();
  } else {
    toastLog("取消了, 请重新运行脚本");
  }
}

// 转跳到作者QQ
function toQQ(qq) {
  const appName = app.getAppName("com.tencent.mobileqq");
  if (!!appName) {
    app.startActivity({
      action: "android.intent.action.VIEW",
      data: "mqqapi://card/show_pslcard?src_type=internal&source=sharecard&version=1&uin=" + qq,
    });
  } else {
    toastLog("作者QQ: " + qq);
  }
}

// 文件权限
function isWritePermission() {
  return android.content.pm.PackageManager.PERMISSION_GRANTED == context.getPackageManager().checkPermission("android.permission.WRITE_EXTERNAL_STORAGE", context.getPackageName());
}

function verifyStoragePermissions() {
  let REQUEST_EXTERNAL_STORAGE = 1;
  let PERMISSIONS_STORAGE = ["android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE"];
  try {
    // 检测是否有写的权限
    let permission = Packages.androidx.core.app.ActivityCompat.checkSelfPermission(activity, "android.permission.WRITE_EXTERNAL_STORAGE");
    if (permission != android.content.pm.PackageManager.PERMISSION_GRANTED) {
      toastLog("没有储存读写权限");
      Packages.androidx.core.app.ActivityCompat.requestPermissions(activity, PERMISSIONS_STORAGE, REQUEST_EXTERNAL_STORAGE);
    } else {
      // toastLog("有储存读写权限");
    }
  } catch (e) {
    log(e);
  }
}

// ui申请权限
function initUi() {
  ui.layout(
    <vertical>
      <appbar>
        <toolbar id="toolbar" title="手心个性短语导出" />
      </appbar>

      <card margin="20" cardCornerRadius="8" cardElevation="8">
        <vertical bg="#F2F2F2" h="*" gravity="top">
          <vertical gravity="center">
            <Switch id="accessibilityService" text="无障碍服务" checked="{{auto.service != null}}" padding="20" bg="#FFFFFF" foreground="?selectableItemBackground" />
            <text h="1" />
            <Switch id="floatViewService" text="悬浮窗权限" checked="{{floaty.checkPermission() != false}}" padding="20" bg="#FFFFFF" foreground="?selectableItemBackground" />
            <text h="1" />
            <Switch id="storage" text="储存读写权限" checked="{{isWritePermission()}}" padding="20" bg="#FFFFFF" foreground="?selectableItemBackground" />
          </vertical>
          <button w="auto" layout_gravity="center" padding="100 20" margin="20" id="start" text="启动" />
        </vertical>
      </card>

      <vertical>
        <text textSize="16sp" text="历史记录:" padding="10" />
        <list id="list" w="*" layout_weight="1" bg="#F2F2F2" marginBottom="20">
          <vertical w="*" marginTop="1" bg="#FFFFFF" padding="12" foreground="?selectableItemBackground">
            <text id="txtFileName" textSize="17sp" textColor="#000000" text="{{txtFileName}}" />
            <text id="total" marginTop="5" text="共{{total}}条短语" />
          </vertical>
        </list>
      </vertical>
    </vertical>
  );

  // 列表数据
  function initListViewData() {
    const dir = files.getSdcardPath() + "/" + saveDuanYvFolder;
    let txtFiles = files.listDir(dir, function (name) {
      return name.startsWith("个性短语") && name.endsWith(".txt") && files.isFile(files.join(dir, name));
    });

    let items = [];

    for (txtFileIndex in txtFiles) {
      let fileName = txtFiles[txtFileIndex];
      let file = open(files.join(dir, fileName));

      items.unshift({
        txtFileName: fileName,
        total: file.readlines().length,
      });

      file.close();
    }

    ui.list.setDataSource(items);

    ui.list.on("item_click", function (item, i, itemView, listView) {
      const path = files.join(dir, item.txtFileName);
      app.viewFile(path);
      toast("路径: " + path);
    });
  }

  // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
  ui.accessibilityService.on("check", function (checked) {
    if (checked && auto.service == null) {
      app.startActivity({
        action: "android.settings.ACCESSIBILITY_SETTINGS",
      });
    }

    if (!checked && auto.service != null) {
      auto.service.disableSelf();
    }
  });

  //创建选项菜单(右上角)
  ui.emitter.on("create_options_menu", (menu) => {
    menu.add("关于");
  });

  const oUrl = "https://github.com/Dev-AHeng/sxdy2t";
  //监听选项菜单点击
  ui.emitter.on("options_item_selected", (e, item) => {
    switch (item.getTitle()) {
      case "关于":
        let d = dialogs
          .build({
            title: "关于",
            content: "开源地址: " + oUrl + "\n\n手心个性短语导出 v2.0.0\n用于将手心输入法的默认个性短语导出到本地txt\nby AHeng\non 24.06.13",
            positive: "qq",
            negative: "取消",
            neutral: "开源",
          })
          .on("any", (action, dialog) => {
            if (action == "positive") {
              toQQ("1919196455");
            } else if (action == "negative") {
            } else if (action == "neutral") {
              app.openUrl(oUrl);
              setClip(oUrl);
              toastLog(oUrl);
            }
          })
          .show();

        break;
    }
    e.consumed = true;
  });

  activity.setSupportActionBar(ui.toolbar);

  // 申请悬浮窗权限
  ui.floatViewService.on("check", function (checked) {
    importClass(android.content.Intent);
    importClass(android.net.Uri);
    importClass(android.provider.Settings);
    let intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + context.getPackageName()));
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
    app.startActivity(intent);
  });

  // 文件读写权限
  ui.storage.on("check", function (checked) {
    verifyStoragePermissions();
  });

  // 当用户回到本界面时，resume事件会被触发
  ui.emitter.on("resume", function () {
    ui.accessibilityService.checked = auto.service != null;
    ui.floatViewService.checked = floaty.checkPermission() != false;
    ui.storage.checked = isWritePermission();

    initListViewData();
  });

  ui.start.on("click", function () {
    if (!app.getAppName("com.xinshuru.inputmethod")) {
      toast("没安装手心输入法");
      return;
    }

    if (auto.service == null) {
      toast("请先开启无障碍服务");
      return;
    }

    if (floaty.checkPermission() == false) {
      toast("请先开启悬浮窗权限");
      return;
    }

    if (!isWritePermission()) {
      toast("请先开储存读写权限");
      return;
    }

    threads.start(function () {
      startScript();
    });
  });

  initListViewData();
}

initUi();
