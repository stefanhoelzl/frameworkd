*AMD*: a kernel with [this patch series](https://patchwork.kernel.org/project/chrome-platform/list/?series=804326) is required.

```bash
# setup dbus policy
$ cp data/org.stefanhoelzl.frameworkd.conf /etc/dbus-1/system.d/
$ busctl call org.freedesktop.DBus /org/freedesktop/DBus org.freedesktop.DBus ReloadConfig

# start dbus service
$ (cd service && cargo build --release)
$ sudo ./target/release/frameworkd

# control keyboard backlight
$ busctl call org.stefanhoelzl.frameworkd /kblight org.stefanhoelzl.framework.KeybLight GetBrightness
$ busctl call org.stefanhoelzl.frameworkd /kblight org.stefanhoelzl.framework.KeybLight SetBrightness y 0
$ busctl call org.stefanhoelzl.frameworkd /kblight org.stefanhoelzl.framework.KeybLight SetBrightness y 100

# control finger print led brightness
$ busctl call org.stefanhoelzl.frameworkd /fprintled org.stefanhoelzl.framework.FprintLed GetBrightnessLevel
$ busctl call org.stefanhoelzl.frameworkd /fprintled org.stefanhoelzl.framework.FprintLed SetBrightnessLevel y 1
$ busctl call org.stefanhoelzl.frameworkd /fprintled org.stefanhoelzl.framework.FprintLed SetBrightnessLevel y 2
$ busctl call org.stefanhoelzl.frameworkd /fprintled org.stefanhoelzl.framework.FprintLed SetBrightnessLevel y 3

# control charge limit
$ busctl call org.stefanhoelzl.frameworkd /battery org.stefanhoelzl.framework.Battery GetChargeLimit
$ busctl call org.stefanhoelzl.frameworkd /battery org.stefanhoelzl.framework.Battery SetChargeLimit y 80
```