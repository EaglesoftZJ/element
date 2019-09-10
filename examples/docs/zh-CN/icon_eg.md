## Icon 图标

提供了一套常用的图标集合。

### 使用方法

直接通过设置类名为 `el-icon-iconName` 来使用即可。例如：

:::demo
```html
<i class="eg-icon-edit"></i>
<i class="eg-icon-share"></i>
<i class="eg-icon-delete"></i>
<el-button type="primary" icon="eg-icon-search">搜索</el-button>

```
:::

### 图标集合

<ul class="icon-list">
  <li v-for="name in $icon_eg" :key="name">
    <span>
      <i :class="'eg-icon-' + name"></i>
      <span class="icon-name">{{'eg-icon-' + name}}</span>
    </span>
  </li>
</ul>
