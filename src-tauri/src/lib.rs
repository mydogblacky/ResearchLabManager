use std::path::Path;

use serde::Serialize;
use serde_json::Value;

#[tauri::command]
fn copy_file(source: String, destination: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&destination).parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::copy(&source, &destination).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

#[derive(Serialize)]
struct Publication {
    biblio_id: String,
    title: String,
    year: Option<i64>,
    #[serde(rename = "type")]
    pub_type: String,
    publication_status: String,
    classification: String,
    doi: String,
    journal: String,
    authors: Vec<String>,
    handle: String,
}

fn first_str(v: &Value, keys: &[&str]) -> String {
    for k in keys {
        if let Some(s) = v.get(k).and_then(Value::as_str) {
            if !s.is_empty() {
                return s.to_string();
            }
        }
    }
    String::new()
}

fn parse_year(v: &Value) -> Option<i64> {
    let raw = v.get("year")?;
    if let Some(n) = raw.as_i64() {
        return Some(n);
    }
    if let Some(s) = raw.as_str() {
        return s.chars().take_while(|c| c.is_ascii_digit()).collect::<String>().parse().ok();
    }
    None
}

fn parse_publication(line: &str) -> Option<Publication> {
    let v: Value = serde_json::from_str(line).ok()?;

    let biblio_id = first_str(&v, &["biblio_id", "_id", "id"]);
    let title = first_str(&v, &["title"]);
    let pub_type = first_str(&v, &["type"]);
    let publication_status = first_str(&v, &["publication_status", "status"]);
    let classification = first_str(&v, &["classification", "vabb_type"]);
    let doi = first_str(&v, &["doi"]);
    let handle = first_str(&v, &["handle"]);

    let journal = v
        .get("parent")
        .and_then(|p| p.get("title"))
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string();

    let authors = v
        .get("author")
        .and_then(Value::as_array)
        .map(|arr| {
            arr.iter()
                .filter_map(|a| {
                    if let Some(full) = a.get("full_name").and_then(Value::as_str) {
                        return Some(full.to_string());
                    }
                    let last = a.get("last_name").and_then(Value::as_str).unwrap_or("");
                    let first = a.get("first_name").and_then(Value::as_str).unwrap_or("");
                    let combined = format!("{} {}", first, last).trim().to_string();
                    if combined.is_empty() { None } else { Some(combined) }
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();

    Some(Publication {
        biblio_id,
        title,
        year: parse_year(&v),
        pub_type,
        publication_status,
        classification,
        doi,
        journal,
        authors,
        handle,
    })
}

#[tauri::command]
async fn fetch_biblio_publications(ugent_id: String) -> Result<Vec<Publication>, String> {
    let trimmed = ugent_id.trim();
    if trimmed.is_empty() {
        return Err("UGent ID is empty".into());
    }
    if !trimmed.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
        return Err("UGent ID must be a numeric ID or a UUID-style identifier".into());
    }

    let url = format!(
        "https://biblio.ugent.be/person/{}/publication/export?format=json",
        trimmed
    );

    let client = reqwest::Client::builder()
        .user_agent("ResearchLabManager/0.1 (Tauri)")
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(&url).send().await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Biblio API returned status {}", response.status()));
    }

    let body = response.text().await.map_err(|e| e.to_string())?;

    let publications: Vec<Publication> = body
        .lines()
        .filter(|l| !l.trim().is_empty())
        .filter_map(parse_publication)
        .collect();

    Ok(publications)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            copy_file,
            file_exists,
            fetch_biblio_publications
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
