import requests
from bs4 import BeautifulSoup
import json
from config import IITM_WEBSITE_URL, COURSE_LEVEL_MAPPING
from concurrent.futures import ThreadPoolExecutor, as_completed
from scripts.extract_playlist_duration import calculate_total_hours
import time
import random
import asyncio


def scrape_course_page(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the course page: {e}")
        return None
    
    return response.text


def get_all_course_urls(html_content):
    # Initialize DOM parser
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Utilize a set to prevent duplicate URLs from being recorded
    course_urls = set()
    
    # Extract URLs from table rows utilizing the custom data-url attribute 
    # (Targets Foundation and Diploma levels)
    for row in soup.find_all('tr', attrs={'data-url': True}):
        url_fragment = row.get('data-url')
        if url_fragment:
            course_urls.add(f"https://study.iitm.ac.in/ds/{url_fragment}")
            
    # Extract URLs from standard anchor tags targeting the course_pages directory
    # (Targets Degree, Electives, PG, and MTech levels)
    for anchor in soup.find_all('a', href=True):
        href_fragment = anchor.get('href')
        if href_fragment and 'course_pages/' in href_fragment:
            course_urls.add(f"https://study.iitm.ac.in/ds/{href_fragment}")
            
    # Convert the set back to a list for standard iteration
    return list(course_urls)


def scrape_course_detail_page(course_url):
    if 'coming-soon' in course_url:
        return None  

    max_retries = 3
    for attempt in range(max_retries):
        try:
            html_content = scrape_course_page(course_url)
            soup = BeautifulSoup(html_content, 'html.parser')
            
            name_tag = soup.find('p', class_='h2 font-weight-600 text-dark')
            name = name_tag.text.strip() if name_tag else None

            level_tag = soup.find(lambda tag: tag.name == 'p' and tag.text and 'Course Type:' in tag.text)
            level = level_tag.text.replace("Course Type:", "").strip() if level_tag else None
            
            # Note: COURSE_LEVEL_MAPPING must be defined in the broader scope
            level = COURSE_LEVEL_MAPPING.get(level.lower(), level) if level else None

            code_tag = soup.find(lambda tag: tag.name == 'p' and tag.text and 'Course ID:' in tag.text)
            code = code_tag.text.replace("Course ID:", "").strip() if code_tag else None

            credits_val = None
            credits_tag = soup.find(lambda tag: tag.name == 'p' and tag.text and 'Course Credits:' in tag.text)
            if credits_tag:
                raw_credits = credits_tag.text.replace("Course Credits:", "").strip()
                try:
                    credits_val = int(raw_credits)
                except ValueError:
                    credits_val = None

            playlist = None
            playlist_tag = soup.find(lambda tag: tag.name == 'a' and tag.text and 'VIEW COURSE VIDEOS' in tag.text.upper())
            if playlist_tag and playlist_tag.has_attr('href'):
                playlist = playlist_tag['href']

            num_hours = None
            if playlist:
                # Executes the asynchronous calculate_total_hours function safely inside a synchronous thread
                num_hours = asyncio.run(calculate_total_hours(playlist))

            return {
                "name": name,
                "code": code,
                "level": level,
                "credits": credits_val,
                "website": course_url,
                "playlist": playlist,
                "num_hours": num_hours
            }

        except Exception as e:
            error_message = str(e).lower()
            if "429" in error_message or "403" in error_message or "too many requests" in error_message:
                if attempt < max_retries - 1:
                    sleep_duration = (2 ** attempt) + random.uniform(0.1, 1.0)
                    time.sleep(sleep_duration)
                    continue
            raise e
            
    return None


def run_scraping_parallel(course_urls, max_workers=5):
    course_details = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(scrape_course_detail_page, url): url for url in course_urls}
        
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                if data:
                    course_details.append(data)
            except Exception as exc:
                print(f"Error processing {url}: {exc}")
    
    return course_details


if __name__ == "__main__":
    # text = scrape_course_detail_page(course_url="https://study.iitm.ac.in/ds/course_pages/BSCS3003.html")
    # print(text)
    # foundation_courses = get_all_course_urls(text)
    # with open("course_content.html", "w", encoding="utf-8") as f:
    #     f.write(text)
    with open("course_URLS.json", "r", encoding="utf-8") as f:
        course_urls = json.load(f)
    course_details = run_scraping_parallel(course_urls, max_workers=10)
    with open("course_details.json", "w", encoding="utf-8") as f:
        json.dump(course_details, f, indent=4)