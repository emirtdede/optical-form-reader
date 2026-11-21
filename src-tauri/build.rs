fn main() {
    println!("cargo:rerun-if-changed=icons/icon.ico");
    println!("cargo:rerun-if-changed=tauri.conf.json");
    println!("cargo:rerun-if-changed=capabilities/default.json");

    tauri_build::build();

    // Verify ACL capability manifests were generated into OUT_DIR
    let out_dir = std::path::PathBuf::from(std::env::var("OUT_DIR").expect("OUT_DIR is not set"));
    for name in ["capabilities.json", "acl-manifests.json"] {
        let path = out_dir.join(name);
        assert!(
            path.is_file(),
            "Missing Tauri ACL manifest {name} at {}",
            path.display()
        );
    }
}
