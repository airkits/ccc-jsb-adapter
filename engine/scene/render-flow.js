/****************************************************************************
 Copyright (c) 2018 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

let RenderFlow = cc.RenderFlow;

RenderFlow.FLAG_REORDER_CHILDREN = 1 << 29;
RenderFlow.FLAG_WORLD_TRANSFORM_CHANGED = 1 << 30;
RenderFlow.FLAG_OPACITY_CHANGED = 1 << 31;

let _list1 = [];
let _list2 = [];
let _pushingList = _list1;
let _traversingList = null;

var director = cc.director;
RenderFlow.render = function (scene) {
    _traversingList = _pushingList;
    if (_pushingList == _list1) {
        _pushingList = _list2;
    } else {
        _pushingList = _list1;
    }

    for (let i = 0, l = _traversingList.length; i < l; i++) {
        let node = _traversingList[i];
        node._inRenderList = false;

        let comp = node._renderComponent;
        if (!comp) continue;
        let assembler = comp._assembler;
        if (!assembler) continue;

        let flag = node._dirtyPtr[0];

        if (flag & RenderFlow.FLAG_UPDATE_RENDER_DATA) {
            node._dirtyPtr[0] &= ~RenderFlow.FLAG_UPDATE_RENDER_DATA;
            assembler._updateRenderData && assembler._updateRenderData();
        }
    }

    _traversingList.length = 0;
    this._nativeFlow.render(scene._proxy, director._deltaTime);
};

RenderFlow.init = function (nativeFlow) {
    cc.EventTarget.call(this);
    this._nativeFlow = nativeFlow;
};

RenderFlow.register = function (target) {
    if (target._inRenderList) return;
    _pushingList.push(target);
    target._inRenderList = true;
};