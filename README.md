# frameworkd
daemon to control system settings of your [Framework](https://frame.work/de/en) laptop.

It provides a d-bus service based on [FrameworkComputer/framework-system](https://github.com/FrameworkComputer/framework-system).
This service can be used with a gnome-shell extension or from the command line without root permissions.

Features:
* change battery charge limit
* change brightness of the fingerprint reader led
* change keyboard backlight brightness

![How it works](howitworks.gif)

## Requirements
__AMD__: a kernel with [this patch series](https://patchwork.kernel.org/project/chrome-platform/list/?series=804326) is required.

## Installation
The latest binaries and packages can be found under the [actions artifacts](/https://github.com/stefanhoelzl/frameworkd/actions?query=branch%3Amain+is%3Asuccess).
```bash
# Fedora
$ dnf install frameworkd-0.1.0-1.x86_64.rpm

# Debian
$ dpkg -i frameworkd_0.1.0-1_amd64.deb 

# Gnome Shell extension
mkdir -p ~/.local/share/gnome-shell/extensions/frameworkctl@stefanhoelzl
unzip frameworkctl@stefanhoelzl.shell-extension-zip -d ~/.local/share/gnome-shell/extensions/frameworkctl@stefanhoelzl
gnome-extensions enable frameworkctl@stefanhoelzl
# restart gnome-shell
#  Wayland
#   logout and login again
#   or start a new session to test the extension: `dbus-run-session -- gnome-shell --nested --wayland`
#  X11: press Alt+F2 and enter `restart`
```

## Usage
```bash
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

## Known Issues
* settings are lost after reboot (see https://github.com/FrameworkComputer/framework-system/issues/25)