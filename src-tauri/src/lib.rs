#[tauri::command]
fn shell_ready() -> bool {
  true
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_store::Builder::new().build())
    .plugin(tauri_plugin_dialog::init())
    .on_window_event(|_window, event| {
      #[cfg(target_os = "android")]
      if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
      }
    })
    .invoke_handler(tauri::generate_handler![shell_ready])
    .run(tauri::generate_context!())
    .expect("error while running Lynx Studio");
}
