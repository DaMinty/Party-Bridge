from flask import Flask, request, jsonify

app = Flask(__name__)
latest_message = None


# http://127.0.0.1:5000/postdata
@app.route('/postdata', methods=['POST'])
def handle_post():
    global latest_message
    data = request.json
    latest_message = data.get('message', 'No message received')
    
    print(f"Received POST request with message: {latest_message}")
    
    return jsonify({"response": "Message received!"}), 200

# http://127.0.0.1:5000/getmessage
@app.route('/getmessage', methods=['GET'])
def get_message():
    global latest_message
    if latest_message:
        response = {"message": latest_message}
        latest_message = None
        return jsonify(response), 200
    else:
        return jsonify({"message": None}), 200

# Run
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)