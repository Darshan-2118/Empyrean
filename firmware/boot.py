# import network
import time
from config import WIFI_SSID, WIFI_PASS

def connect_wifi():
    print("Hardware Mode: network module commented out for PC testing.")
    # wlan = network.WLAN(network.STA_IF)
    # wlan.active(True)
    # if not wlan.isconnected():
    #     print('Connecting to network...')
    #     wlan.connect(WIFI_SSID, WIFI_PASS)
    #     while not wlan.isconnected():
    #         time.sleep(1)
    #         pass
    # print('Network config:', wlan.ifconfig())

connect_wifi()
