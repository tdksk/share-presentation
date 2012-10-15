Share Presentation
==================

Demo
----

<http://tdksk.com/s/>

Supported browsers
------------------

* Google Chrome
* Safari

Required
--------

* node v0.8.8
* npm
* mongodb

How to run
----------

    $ cd share-presentation
    $ npm install
    $ node app

How to use
----------

### プレゼンテーションファイルを準備する
* Access to http://localhost:8080
* Sign up from signup page
* Login from top page
* Create presentation
* Edit presentation (write in HTML5) and save (Ctrl-S, Cmd-S)

### プレゼンテーションを行う (Presenter)
* Login from top page
* Click 'Show' from dashboard

### プレゼンテーションを見る (Listener)
* Access the same URL as presenter's

### プレゼンテーション中に統計情報を見る (Presenter)
* Login from top page
* Click 'Statistics' from dashboard

### 管理者用
* Login from '/admin'

プレゼンテーションスライドの操作方法
------------------------------------

### PC

* 'Enter', 'Space', 'Right', 'j', 'l'  => Next page
* 'Left', 'k', 'h'  => Previous page
* 'o' => ボタンの表示/非表示切り替え
* 'g' (Listener) => Good!
* 'b' (Listener)=> Bad...
* '0' (Listener) => Presenter の現在のページと同期
* '0' (Presenter) => Reset view count (Statistics がおかしくなったら実行する)

### Smartphone, Tablet

* Swipe Left => Next page
* Swipe Right => Previous page

Presenter のみの機能
--------------------

* 手書き (ドラッグ)
* Listener のページを追従させる (ただし、Presenter と違うページを見ている Listener のページは追従させない)

Statistics の見方
-----------------
* Red line=> Presenter の現在のページ
* Blue bar => Listener view count
