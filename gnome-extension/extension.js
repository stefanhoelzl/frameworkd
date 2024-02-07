import St from "gi://St";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";

import {Extension} from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";


const SubMenu = GObject.registerClass(
    class SubMenu extends PopupMenu.PopupSubMenuMenuItem {
        static create(title, icon_path, action, mappings) {
            const subMenu = new SubMenu(title, icon_path);
            Object.entries(mappings)
                .forEach(
                    ([label, value]) => subMenu.add_item(label, () => action(value))
                );
            return subMenu
        }
        _init(title, icon_path){
            super._init(title, true);
            this.icon.gicon = Gio.icon_new_for_string(icon_path)
            this.actor.insert_child_at_index(new St.Label({
                y_expand: true,
                y_align: Clutter.ActorAlign.CENTER
            }), 4);
        }

        set_value(value) {
            this.actor.get_child_at_index(4).text = value;
        }

        add_item(label, action) {
            this.menu.addAction(label, () => {
                action();
                this.set_value(label);
            });
        }
    }
)


const FrameworkCtlMenuButton = GObject.registerClass(
    class FrameworkCtlMenuButton extends PanelMenu.Button {
        _init(icon_path) {
            super._init(0.0, "FrameworkCtlMenuButton");
            this.add_child(new St.Icon({
                gicon: Gio.icon_new_for_string(icon_path),
                style_class: "system-status-icon"
            }));
            this.menu._arrowAlignment = 0.5;
        }

        add_submenu(submenu) {
            this.menu.addMenuItem(submenu)
        }
    }
)

class FrameworkCtl {
    async get_charge_limit() {
        return this._get_value("/battery", "org.stefanhoelzl.framework.Battery", "GetChargeLimit");
    }

    async set_charge_limit(limit) {
        return this._set_value("/battery", "org.stefanhoelzl.framework.Battery", "SetChargeLimit", limit);
    }

    async get_fp_brightness_level() {
        return this._get_value("/fprintled", "org.stefanhoelzl.framework.FprintLed", "GetBrightnessLevel");
    }

    async set_fp_brightness_level(level) {
        return this._set_value("/fprintled", "org.stefanhoelzl.framework.FprintLed", "SetBrightnessLevel", level);
    }

    async get_kb_brightness() {
        return this._get_value("/kblight", "org.stefanhoelzl.framework.KeybLight", "GetBrightness");
    }

    async set_kb_brightness(brigthness) {
        return this._set_value("/kblight", "org.stefanhoelzl.framework.KeybLight", "SetBrightness", brigthness);
    }

    async _get_value(path, iface, method) {
        const reply = await this._dbus_call(path, iface, method, null);
        return reply.get_child_value(0).get_byte();
    }

    async _set_value(path, iface, method, value) {
        await this._dbus_call(path, iface, method, new GLib.Variant("(y)", [value])).catch(e => console.error(e));
    }

    async _dbus_call(path, iface, method, parameters) {
        return await Gio.DBus.system.call(
            "org.stefanhoelzl.frameworkd",
            path,
            iface,
            method,
            parameters,
            null,
            Gio.DBusCallFlags.NONE,
            -1,
            null
        );
    }
}

export default class FrameworkCtlExtension extends Extension {
    enable() {
        const ctl = new FrameworkCtl();

        const chargeLimitMenu = SubMenu.create(
            "Charge Limit",
            this.path + "/icons/battery-symbolic.svg",
            (limit) => ctl.set_charge_limit(limit),
            { "100%": 100, " 90%": 90, " 80%": 80, " 75%": 75, " 50%": 50},
        )
        const fpBrightnessMenu = SubMenu.create(
            "Fprint Brightness",
            this.path + "/icons/fingerprint-symbolic.svg",
            (level) => ctl.set_fp_brightness_level(level),
            { "55%": 3, "40%": 2, "15%": 0 },

        )
        const kbBrightnessMenu = SubMenu.create(
            "Keyboard Backlight",
            this.path + "/icons/keyboard-brightness-symbolic.svg",
            (brightness) => ctl.set_kb_brightness(brightness),
            { "100%": 100, " 50%": 50, " 20%": 20, " Off": 0 }
        )

        const refreshValues = () => {
            ctl.get_charge_limit().then(v => chargeLimitMenu.set_value(`${v}%`));
            ctl.get_fp_brightness_level().then(v => fpBrightnessMenu.set_value(`${v}%`));
            ctl.get_kb_brightness().then(v => kbBrightnessMenu.set_value(v === 0 ? " Off" : `${v}%`))
        }

        this._menu_button = new FrameworkCtlMenuButton(this.path + "/icons/framework.svg");
        this._menu_button.add_submenu(chargeLimitMenu);
        this._menu_button.add_submenu(fpBrightnessMenu);
        this._menu_button.add_submenu(kbBrightnessMenu);
        this._menu_button.connect("button-press-event", refreshValues)
        refreshValues();

        Main.panel.addToStatusArea(this.uuid, this._menu_button);
    }

    disable() {
        this._menu_button?.destroy();
        this._menu_button = null;
    }
}
