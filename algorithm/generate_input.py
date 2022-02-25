import json
import random

def generate_random_data():   
    rows = []
    rowN = 100

    dict = {
        "sex": 1,
        "exang": 1,
        "ca": 4,
        "cp": 3,
        "oldpeak": 5
    }
    keys_list = list(dict)

    for column in range(len(dict.keys())):
        row = []
        for r in range(rowN):  
            choices = list(range(dict[keys_list[column]]+1))            
            row.append(random.choice(choices))
        rows.append(row) 

    return rows

if __name__ == "__main__":   

    data = generate_random_data() 

    output = 'input.json'
    f = open(output, "w")    
    f.write(json.dumps(data))
    f.close()