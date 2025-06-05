import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

from recommendation.predictor import get_hybrid_recommendations # Your recommendation logic
# Make sure database_utils is accessible, if it's external, adjust path/import
# from database_utils import get_db_connection 
# If database_utils is only for health check and not critical for the ML model itself,
# you might not need it here unless get_hybrid_recommendations relies on it directly for its own DB access.
# Assuming get_db_connection is still needed for health check.
from database_utils import get_db_connection
from question_generator.routes import question_gen_bp # Assuming this Blueprint is correctly structured

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Register Blueprint for question generator (if applicable)
app.register_blueprint(question_gen_bp, url_prefix='/api/question-generator')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify service and database connectivity.
    """
    try:
        # Attempt to connect to the database
        db = get_db_connection()
        db.command('ping') # A simple command to check connection
        logger.info("Health check successful: Database connection established.")
        return jsonify({"status": "healthy", "database_connection": "successful"}), 200
    except Exception as e:
        logger.error(f"Health check failed: {e}", exc_info=True)
        return jsonify({
            "status": "unhealthy",
            "database_connection": "failed",
            "error": str(e)
        }), 500

# CHANGED: Route for recommendations now accepts POST requests
#          and the user_id is passed in the request body, not the URL.
@app.route('/recommendations', methods=['POST'])
def get_recommendations_route():
    """
    Endpoint to receive user data and return hybrid course recommendations.
    Expects a JSON body with 'user_data', 'top_n' (optional), and 'alpha' (optional).
    """
    try:
        data = request.get_json() # Get the JSON payload from the request body

        if not data:
            logger.warning("Received empty or non-JSON request for recommendations.")
            return jsonify({"message": "No input data provided. Expected JSON."}), 400

        user_data = data.get('user_data')
        top_n = int(data.get('top_n', 5)) # Default to 5 if not provided
        alpha = float(data.get('alpha', 0.6)) # Default to 0.6 if not provided

        # Ensure user_data and user_id are present
        if not user_data or 'user_id' not in user_data:
            logger.error(f"Missing 'user_data' or 'user_id' in request payload: {data}")
            return jsonify({"message": "User data or user_id is missing from the request."}), 400
        
        user_id = user_data['user_id'] # Extract user_id from the payload for logging/predictor

        logger.info(f"Generating recommendations for user: {user_id} with top_n={top_n}, alpha={alpha}")
        
        # Call the hybrid recommendation function, passing the full user_data dictionary
        recommendations = get_hybrid_recommendations(user_id, top_n, alpha, user_data=user_data)

        if "error" in recommendations:
            logger.error(f"Recommendation generation failed for user {user_id}: {recommendations['error']}")
            return jsonify({"message": recommendations["error"]}), 500

        logger.info(f"Successfully generated {len(recommendations.get('recommendations', []))} recommendations for user {user_id}.")
        return jsonify(recommendations) # recommendations is already a dict like {"recommendations": [...]}

    except ValueError:
        logger.error("Invalid top_n or alpha parameter format in request.", exc_info=True)
        return jsonify({"message": "Invalid 'top_n' or 'alpha' parameter. Please ensure they are numbers."}), 400
    except Exception as e:
        logger.error(f"An unexpected error occurred in recommendation endpoint for user: {user_id}", exc_info=True)
        return jsonify({"message": "An internal error occurred while generating recommendations."}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting ML Service...")
    # Determine the port from environment variable or default to 5001
    port = int(os.getenv('PORT', 5001))
    # Determine debug mode from environment variable
    debug_mode = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    
    app.run(
        host='0.0.0.0', # Listen on all available network interfaces
        port=port,
        debug=debug_mode # Set to True for development, False for production
    )