import requests
from bs4 import BeautifulSoup
import json


WEBSITE_URL = "https://study.iitm.ac.in/ds/academics.html#AC1"


def scrape_course_page():
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(WEBSITE_URL, headers=headers)
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



if __name__ == "__main__":
    text = scrape_course_page()
    foundation_courses = get_all_course_urls(text)
    with open("course_URLs.json", "w", encoding="utf-8") as f:
        json.dump(foundation_courses, f, indent=4)