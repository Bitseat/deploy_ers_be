# importing all required libraries
import os
import traceback

# importing libraries for computer vision
import numpy as np
import cv2 
import imutils
from imutils import contours
from imutils.perspective import four_point_transform
from skimage.filters import threshold_local

# importing libraries to read text from image
from PIL import Image
import pytesseract

import re
import json
from docx2pdf import convert

from pyresparser import ResumeParser
import image_text_extractor
from image_text_extractor import image_extract

import subprocess
from os import rename
import shutil

def main():
    # import resumes from directory
    directory = 'resumes/'
    dir_list = os.listdir(directory)
    dir_list.sort(key=lambda f: os.path.splitext(f)[1], reverse = True)
 

    for filename in dir_list:
        
        if filename.endswith(".pdf"):
            full_path = os.path.join(directory, filename)

            extract_info(full_path)

        elif filename.endswith(".docx"):
            full_path = os.path.join(directory, filename)

            out = subprocess.Popen(['unoconv',  str(full_path)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            stdout,stderr = out.communicate()

                
            #target_path = os.path.join(os.path.dirname(__file__), str(full_path[:-5]) + ".pdf")
          
            #new_path = str(target_path[:-4]) + ".docx" + ".pdf"

            #rename(target_path, new_path)
             
            extract_info(full_path)
           

        elif filename.endswith(".jpg"):
            full_path = os.path.join(directory, filename)
            x = image_extract()

            out = subprocess.Popen(['unoconv',  str(full_path)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            stdout,stderr = out.communicate()
            #target_path = os.path.join(os.path.dirname(__file__), str(x) + ".pdf")
          
            extract_info(x)

               
        else:
            pass


def extract_info(full_path):

    directory2 = 'jsons/'
    data = {}
    with open(full_path, 'r') as f:

        data = ResumeParser(full_path).get_extracted_data()
        z = full_path.replace('resumes/','')

        json_file_name = str(directory2) + str(z) + ".json"
        
        clean_data = re.sub('\u2013', '', str(data))
        clean_data = re.sub('\uf0b7', '', clean_data)
        clean_data = re.sub(r'\\uf0b7', '', clean_data)
        clean_data = re.sub(r'[^\x00-\x7F]+|\x0c',' ', clean_data)
        clean_data = re.sub(r"'", '"', clean_data)
        clean_data = re.sub(r'None', 'null', clean_data)
        clean_data = json.loads(clean_data.replace("\'", '"'))
        
        
    with open(json_file_name, 'w') as outfile:
        json.dump(clean_data, outfile)
    if full_path.endswith(".jpg.docx"):
        os.remove(full_path)
    


    movefiles()


def movefiles():
    directory = 'resumes/' 
    directory3 = 'pdfs/' 
    for fname in os.listdir(directory):
        if fname.lower().endswith('.pdf'):
            shutil.move(os.path.join(directory, fname), os.path.join(directory3, fname))
        
      
            
 
if __name__ == '__main__':
    main()







