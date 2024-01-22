import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# First some helpful definitions

def calcDelta(df):
    '''Return euclidian distance between adjacent points'''
    return np.sqrt(np.diff(df.x, prepend=[0])**2 + np.diff(df.y, prepend=[0])**2)

def calcVelocity(df):
    '''Return velocity to reach point at given time'''
    return np.divide(calcDelta(df), np.diff(df.ts, prepend=[1]))

def movavg(v, n):
    '''Return rolling average of some vector over n points centered, prepend with 0s'''
    # return v.rolling(n, center=True).mean()

    r = np.cumsum(v)
    r[n:] = r[n:] - r[:-n]
    return r[n-1:] / n

def sdev(x, y, n):
    '''Return rolling std dev over centered window of length n'''
    xs = x.rolling(n, min_periods=1, center=True).std()
    ys = y.rolling(n, min_periods=1, center=True).std()

    return np.sqrt(xs**2 + ys**2)

def sdevmin(x, y, n):
    '''Return rolling std dev over centered window of length n'''
    vels = sdev(x, y, n)
    
    return vels.rolling(66, min_periods=1, center=True).min()

def med(x, y, n):
    '''Return rolling media over centered window of length n'''
    xs = x.rolling(n, min_periods=1, center=True).median()
    ys = y.rolling(n, min_periods=1, center=True).median()

    return np.sqrt(xs**2 + ys**2)
    
    
def detect_fix_ivt(df, sacvel = 20.):
    '''
    I-VT Saccadic Detection (Salvucci and Goldberg (2000))
    Code based very loosely on gians repo code (https://github.com/gian/eventdetect)
    '''
    
    def describe_fix(fixation, fixnr):
        '''return a description of the fixation (nparray!) as a tupple'''

        start = fixation[0,0]
        l = fixation[-1,0] - start
        xs = fixation[:,1]
        ys = fixation[:,2]

        if len(fixation)>1:
            cov = np.cov(xs, ys)
            sx = np.sqrt(cov[0,0])
            sy = np.sqrt(cov[1,1])
            rho = cov[0,1] / (sx*sy)
        else:
            sx = sy = rho = 0

        return (start, l, fixation[0,3], len(fixation), np.mean(xs), np.mean(ys), sx, sy, rho)
    
    if df.size == 0:
        return pd.DataFrame([], columns = ("ts", "len", "i", "n", "x", "y", "sx", "sy", "rho")), None, None
    v = calcVelocity(df)
    x = df.x.values
    y = df.y.values
    ts = df.ts.values
    
    v[0] = 10000.
    
    labels = np.zeros(len(v))
    fixnr = 1   
    fixation = []
    fixations = []
    prev = 0
    for i in range(len(v)):
        if v[i] < sacvel:
            fixation.append((ts[prev], x[prev], y[prev], prev))
            labels[prev] = fixnr
            prev = i
        elif len(fixation)==0: # and v[i] >= sacvel:
            prev = i
            continue
        else:
            # emit fixation
            labels[prev] = fixnr
            fixation.append((ts[prev], x[prev], y[prev], prev))
            
            fixations.append(describe_fix(np.array(fixation), fixnr))
            fixnr += 1
            
            fixation = []
            prev = i
            
                
    if len(fixation)>0:
        labels[i] = fixnr
        fixations.append(describe_fix(np.array(fixation), fixnr))
        
    fixations = pd.DataFrame(fixations, 
                             columns = ("ts", "len", "i", "n", "x", "y", "sx", "sy", "rho"))
    return fixations, v, labels

def detect_fix_idt(df, dispval = 1, minwindow = 6):
    '''
    I-DT Fixation Detetion (Salvucci and Goldberg (2000))
    Code based very loosely on gians repo code (https://github.com/gian/eventdetect)
    '''
    
    def dispersion(x, y, start, length):

        if length == 0:
            return np.nan()

        minxy = np.min((x[start:start+length+1], y[start:start+length+1]), axis=1)
        maxxy = np.max((x[start:start+length+1], y[start:start+length+1]), axis=1)

        return np.sum(maxxy - minxy)
        

    def describe_fix(x, y, ts, start, length):
        '''return a description of the fixation as a tupple'''

        s = ts[start]
        l = ts[start+length-1] - s
        
        if length>1:
            cov = np.cov(x[start:start+length], y[start:start+length])
            sx = np.sqrt(cov[0,0])
            sy = np.sqrt(cov[1,1])
            rho = cov[0,1] / (sx*sy)
        else:
            sx = sy = rho = 0

        return (s, l, start, length, np.mean(x[start:start+length]), np.mean(y[start:start+length]), sx, sy, rho)

    x = df.x.values
    y = df.y.values
    ts = df.ts.values
    
    fixations = []
    i = 0
    while (i<len(x)):
        
        l = np.min((minwindow, len(x)-i))
        d = dispersion(x, y, i, l)
        
        if (d<=dispval):
            while ((d<=dispval) and (i+l < len(x))):
                l += 1
                d = dispersion(x, y, i, l)
                
            fixations.append(describe_fix(x, y, ts, i, l))
            i += l
        else:
            i += 1
            
    fixations = pd.DataFrame(fixations, 
                             columns = ("ts", "len", "i", "n", "x", "y", "sx", "sy", "rho"))
    return fixations, None, None

def find_sacc_from_fix(fixations):
    '''Return saccades from periods between fixations'''
    saccades = []
    
    # pi = px = py = pts = 
    pi = fixations.i[0]
    px = fixations.x[0]
    py = fixations.y[0]
    pts = fixations.ts[0]

    for i, f in fixations[1:].iterrows():
        a = np.max((0, pi-1))
        b = f.i
        dx = f.x - px
        dy = f.y - py
        dxy = np.sqrt(dx**2 + dy**2)
        dts = f.ts - pts
        
        if a != b:
            # saccades.append((a, b, b - a, dxy, dts*1000))

            saccades.append((pts, dts, a, b - a, dxy, dts*1000))

        pi = f.i + f.n
        pts = f.ts + f.len
        px = f.x
        py = f.y

    return pd.DataFrame(saccades, columns = ("ts", "len", "i", "n", "dxy", "dts"))
