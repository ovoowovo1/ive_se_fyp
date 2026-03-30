import pandas as pd

data = {
    'Apples': [200, 152, 126, 217, 176],
    'Bananas': [155, 182, 169, 152, 174],
    'Cherries': [189, 174, 151, 160, 187],
    'Grapes': [254, 230, 184, 242, 176],
    'Organes': [340, 320, 210, 298, 169]
}

columns = ['ParknShop', 'Gateway', 'City Super', 'Q Club', '3hree Sixty']

x = pd.DataFrame(data, index=columns)

b = x[['Bananas']].loc['City Super']

b = x['Bananas']




c = x['Apples'] > 150
c = x[c]
print(c)

'''
x['Total'] = x.sum(axis=1)

x = x.reset_index(drop=True)

print(x.to_string(index=False))



import numpy as np

num = np.random.randint(101,201, size=(4,6))

print(num)

num2  = num.flatten()[::4].reshape(2,3)
print(num2)

num3 = num[:,[2,4]]

print(num3) 


num4 = num'''



x = input("Input: ")

x = x.split(" ")
x =  x[-1::-1]


for i in x :
    print(i , end=" ")