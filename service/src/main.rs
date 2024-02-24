use std::{error::Error, future::pending};
use framework_lib::chromium_ec::commands::FpLedBrightnessLevel;
use zbus::{ConnectionBuilder, dbus_interface};
use framework_lib::chromium_ec::{CrosEc, CrosEcDriverType};

struct Battery {
    cros_ec: CrosEc
}
#[dbus_interface(name = "org.stefanhoelzl.framework.Battery")]
impl Battery {
    fn get_charge_limit(&mut self) -> u8 {
        self.cros_ec.get_charge_limit().unwrap().1
    }

    fn set_charge_limit(&mut self, limit: u8) {
        self.cros_ec.set_charge_limit(0, limit).unwrap();
    }
}

struct FingerprintReaderLed {
    cros_ec: CrosEc
}
#[dbus_interface(name = "org.stefanhoelzl.framework.FprintLed")]
impl FingerprintReaderLed {
    fn get_brightness_level(&mut self) -> u8 {
        self.cros_ec.get_fp_led_level().unwrap()
    }

    fn set_brightness_level(&mut self, level: u8) {
        self.cros_ec.set_fp_led_level(match level {
            1 => FpLedBrightnessLevel::Low,
            2 => FpLedBrightnessLevel::Medium,
            3 => FpLedBrightnessLevel::High,
            _ => FpLedBrightnessLevel::Low,
        }).unwrap();
    }
}

struct KeyboadBacklight {
    cros_ec: CrosEc
}

#[dbus_interface(name = "org.stefanhoelzl.framework.KeybLight")]
impl KeyboadBacklight {
    fn set_brightness(&mut self, percent: u8) {
        self.cros_ec.set_keyboard_backlight(percent);
    }

    fn get_brightness(&mut self) -> u8 {
        self.cros_ec.get_keyboard_backlight().unwrap()
    }
}

fn autoselect_cros_ec() -> Result<CrosEc, &'static str> {
    for driver in vec![CrosEcDriverType::CrosEc, CrosEcDriverType::Portio] {
        if let Some(cros_ec) = CrosEc::with(driver) {
            if cros_ec.version_info().is_ok() {
                return Ok(cros_ec);
            }
        }
    }

    Err("no driver found")
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn Error>> {
    let cros_ec = autoselect_cros_ec()?;

    let _conn = ConnectionBuilder::system()?
        .name("org.stefanhoelzl.frameworkd")?
        .serve_at("/battery", Battery { cros_ec: cros_ec.clone() })?
        .serve_at("/fprintled", FingerprintReaderLed { cros_ec: cros_ec.clone() })?
        .serve_at("/kblight", KeyboadBacklight { cros_ec: cros_ec.clone() })?
        .build()
        .await?;

    println!("frameworkd started");
    pending::<()>().await;
    Ok(())
}