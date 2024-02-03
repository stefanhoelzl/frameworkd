use std::{error::Error, future::pending};
use framework_lib::chromium_ec::commands::FpLedBrightnessLevel;
use zbus::{ConnectionBuilder, dbus_interface};
use framework_lib::chromium_ec::CrosEc;

struct Battery {}
#[dbus_interface(name = "org.stefanhoelzl.framework.Battery")]
impl Battery {
    fn get_charge_limit(&mut self) -> u8 {
        let cros_ec = CrosEc::new();
        cros_ec.get_charge_limit().unwrap().1
    }

    fn set_charge_limit(&mut self, limit: u8) {
        let cros_ec = CrosEc::new();
        cros_ec.set_charge_limit(0, limit).unwrap();
    }
}

struct FingerprintReaderLed {}
#[dbus_interface(name = "org.stefanhoelzl.framework.FprintLed")]
impl FingerprintReaderLed {
    fn get_brightness_level(&mut self) -> u8 {
        let cros_ec = CrosEc::new();
        cros_ec.get_fp_led_level().unwrap()
    }

    fn set_brightness_level(&mut self, level: u8) {
        let cros_ec = CrosEc::new();
        cros_ec.set_fp_led_level(match level {
            1 => FpLedBrightnessLevel::Low,
            2 => FpLedBrightnessLevel::Medium,
            3 => FpLedBrightnessLevel::High,
            _ => FpLedBrightnessLevel::Low,
        }).unwrap();
    }
}

struct KeyboadBacklight {}
#[dbus_interface(name = "org.stefanhoelzl.framework.KeybLight")]
impl KeyboadBacklight {
    fn set_brightness(&mut self, percent: u8) {
        let cros_ec = CrosEc::new();
        cros_ec.set_keyboard_backlight(percent);
    }

    fn get_brightness(&mut self) -> u8 {
        let cros_ec = CrosEc::new();
        cros_ec.get_keyboard_backlight().unwrap()
    }
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let _conn = ConnectionBuilder::system()?
        .name("org.stefanhoelzl.frameworkd")?
        .serve_at("/battery", Battery {})?
        .serve_at("/fprintled", FingerprintReaderLed {})?
        .serve_at("/kblight", KeyboadBacklight {})?
        .build()
        .await?;

    println!("service running...");
    pending::<()>().await;
    Ok(())
}