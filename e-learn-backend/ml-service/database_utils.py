import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import random # <--- ADD THIS IMPORT!

# Load environment variables from .env file (assuming it's at the project root)
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

def get_db_connection():
    """Establishes a connection to MongoDB."""
    db_uri = os.getenv("MONGO_URI")
    if not db_uri:
        raise ValueError("MONGO_URI environment variable not set. Please set it in your .env file.")
    try:
        client = MongoClient(db_uri)
        return client.get_database() # This will get the database specified in the URI
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise

def fetch_all_courses_for_content_based_training():
    """
    Fetches course data from MongoDB and prepares it for content-based filtering.
    Includes new 'subject', 'format', 'difficulty' fields and text resource summaries.
    """
    db = get_db_connection()
    courses_collection = db['courses'] # Assuming your collection is named 'courses'
    
    content_data_list = []
    print("Fetching courses for content-based training...")
    for course_doc in courses_collection.find({}):
        course_id = str(course_doc['_id']) # Convert ObjectId to string
        title = course_doc.get('title', '')
        description = course_doc.get('description', '')
        subject = course_doc.get('subject', '')
        format_val = course_doc.get('format', 'Mixed') # Default to 'Mixed' if not set
        difficulty_val = course_doc.get('difficulty', 'Beginner') # Default to 'Beginner'

        # Combine video titles/summaries (if you've added them)
        video_content = " ".join([v.get('title', '') for v in course_doc.get('videos', [])])
        
        # Combine text resource summaries
        text_content = " ".join([tr.get('summary', '') for tr in course_doc.get('textResources', []) if tr.get('summary')])
        
        # Create the combined features string for TF-IDF
        # Prioritize title, description, and explicit tags. Add video/text content.
        combined_features_str = f"{title} {description} {subject} {format_val} {difficulty_val} {video_content} {text_content}".strip()
        
        content_data_list.append({
            'CourseID': course_id,
            'Subject': subject,
            'Format': format_val,
            'Difficulty': difficulty_val,
            'combined_features': combined_features_str # This is the main feature for TFIDF
        })
    print(f"Fetched {len(content_data_list)} courses.")
    return pd.DataFrame(content_data_list)

def fetch_user_ratings_and_enrollments():
    """
    Fetches user-course interaction data for collaborative filtering.
    This function's logic is highly dependent on your actual user interaction schema.
    
    Current example assumes:
    1. 'courses' collection has 'enrolledStudents' array (user ObjectIds).
      Each enrollment implies a positive interaction (e.g., a 'rating' of 5).
    2. Ideally, you would have a dedicated 'enrollments' or 'user_progress'
      collection with explicit ratings or completion statuses.
    """
    db = get_db_connection()
    user_interactions = []
    
    print("Fetching user interactions for collaborative filtering...")
    # Iterate through courses and their enrolled students
    courses_collection = db['courses']
    for course_doc in courses_collection.find({}, {'_id': 1, 'enrolledStudents': 1}):
        course_id = str(course_doc['_id'])
        enrolled_students = course_doc.get('enrolledStudents', [])
        
        for student_oid in enrolled_students:
            user_id = str(student_oid) # Convert ObjectId to string
            # Assign a default 'rating' if not explicitly stored.
            # In a real system, you might get this from a 'progress' or 'rating' collection.
            
            # --- REPLACE THIS LINE ---
            # rating = 5 # Assume enrollment means a positive interaction/rating
            
            # --- WITH THIS LINE TO INTRODUCE VARIANCE ---
            rating = random.randint(3, 5) # Assigns a random rating between 3 and 5 (inclusive)
            
            user_interactions.append({
                'UserID': user_id,
                'CourseID': course_id,
                'Rating': rating
            })
            
    # --- IMPORTANT ---
    # If you have a separate collection for explicit ratings/progress, query that instead.
    # Example if you had a 'ratings' collection:
    # ratings_collection = db['ratings']
    # for rating_doc in ratings_collection.find({}):
    #   user_interactions.append({
    #       'UserID': str(rating_doc['userId']),
    #       'CourseID': str(rating_doc['courseId']),
    #       'Rating': rating_doc['value'] # Assuming 'value' is the rating
    #   })

    print(f"Fetched {len(user_interactions)} user interactions.")
    if not user_interactions:
        print("WARNING: No user interactions found. Collaborative Filtering might not be effective.")
    return pd.DataFrame(user_interactions)