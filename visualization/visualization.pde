import java.util.Map;
import java.util.Vector;
import java.util.List;
import java.util.Collection;
import java.util.*;
import java.text.*;
JSONArray json;

HashMap<Integer,Float> columnToScreen;
HashMap<String, HashMap<Integer,List<JSONObject>>> user_phase_object;
HashMap<String, List<JSONObject>> user_objectsByDate;

float nameWidth;
float eventWidth;
float circleSize;
int maxEventsPerRow;
float ySpace;
float ySpaceUser;
float initY;


void setup()
{
  size(1600,1000);
  
  nameWidth = 300;
  eventWidth = width/10.0f;
  circleSize = 17;
  maxEventsPerRow = 7;
  ySpace = 34;
  ySpaceUser = 70;
  
  initY = 50;
  json = loadJSONArray("http://ariadne.cs.kuleuven.be/wespot/inquiries/getById/26368");
  user_phase_object = new HashMap<String, HashMap<Integer,List<JSONObject>>>();
  user_objectsByDate = new HashMap<String, List<JSONObject>>();
  for(int i=0;i<json.size();i++)
  {
    
    
    JSONObject obj = json.getJSONObject(i);
    String username = obj.getString("username");  
    int phase = obj.getJSONObject("context").getInt("phase");
    /*if(!usernames.containsKey(username))
    {
      usernames.put(username, usernames.size()+1);
    }*/
    if(!user_phase_object.containsKey(username))
    {
      user_phase_object.put(username, new HashMap<Integer,List<JSONObject>>());
      user_objectsByDate.put(username, new ArrayList<JSONObject>());
    }
    HashMap<Integer,List<JSONObject>> phase_object = (HashMap<Integer,List<JSONObject>>)user_phase_object.get(username);
   if(!phase_object.containsKey(phase))
    {
      phase_object.put(phase, new ArrayList<JSONObject>());
    }
    phase_object.get(phase).add(obj);
    user_objectsByDate.get(username).add(obj);
    
  }
  for(JSONObject o : user_objectsByDate.get("weSPOT_svencharleer"))
  {
    println(o.getString("timestamp"));
  }
  //we also need events by user sorted by date
  for (Map.Entry objects :user_objectsByDate.entrySet()) 
  {
    List<JSONObject> l = (List<JSONObject>)objects.getValue();
    Collections.sort(l, new Comparator<JSONObject>(){
      @Override
      public int compare(JSONObject a, JSONObject b){
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS");
        try{
        Date aDate = sdf.parse(a.getString("timestamp"));
        Date bDate = sdf.parse(b.getString("timestamp"));
        return aDate.compareTo(bDate);
        }
        catch(ParseException exc)
        {
          println(exc.getMessage());
          return 0;
        }
      }
    });
  }
  for(JSONObject o : user_objectsByDate.get("weSPOT_svencharleer"))
  {
    println(o.getString("timestamp"));
  }
  
  columnToScreen = new HashMap<Integer, Float>();
  columnToScreen.put(0,0.0f);
  columnToScreen.put(1,nameWidth);
  columnToScreen.put(2,nameWidth + eventWidth);
   columnToScreen.put(3,nameWidth + eventWidth *2.0f);
    columnToScreen.put(4,nameWidth + eventWidth * 3.0f);
     columnToScreen.put(5,nameWidth + eventWidth *4.0f);
      columnToScreen.put(6,nameWidth + eventWidth * 5.0f);
  
  
  
  
}

void draw()
{
  drawByTime();
}

void drawByTime()
{
  //background(#383838);
  drawBG();
  fill(0);
  int i = 0;
  float y = initY;
  for (Map.Entry objects :user_objectsByDate.entrySet()) 
  {
    
    fill(255,255,255);
    text((String)objects.getKey(), 0, y+3);
    
     int prevPhase = 1;
     int column = 0;
     float prevX = 0;
     float prevY = 0;
     for(JSONObject o : (List<JSONObject>) objects.getValue())
     {
       int phase = o.getJSONObject("context").getInt("phase");
       if(column > maxEventsPerRow)
       {
         column = 0;
         y += ySpace;
       }
       if(prevPhase != phase)
       {
         column = 0;
       }
       if(prevPhase > phase)
       {
         y += ySpace;
       }
       prevPhase = phase;
       
       float x = map(column, 0, maxEventsPerRow, columnToScreen.get(phase), columnToScreen.get(phase) + eventWidth-circleSize*1.5f);
       stroke(255,255,255);
       strokeWeight(1);
       if(prevX > 0.0f && prevY > 0.0f)
       {
         if(prevX > x)
         {
           line(prevX, prevY+circleSize/2.0f, prevX,prevY+circleSize);
           line(prevX, prevY+circleSize, x, y-circleSize);
           line(x, y-circleSize, x,y);
           
         }
         else
         {
           line(prevX+circleSize/2.0f, prevY, x, y);
         }
       }
       setPhaseColor(phase);
       strokeWeight(1);
       //stroke(#6d6d6d);
       ellipse(x,y,circleSize,circleSize);
       
       
       prevX = x;
       prevY = y;
       
       column++;
       
     }
     
       y+=ySpaceUser;
       stroke(#095868);
       strokeWeight(4);
       line(0,y-ySpaceUser/2.0f, width,y-ySpaceUser/2.0f);
    
    smooth();
  }
}

void drawNormal()
{
  background(255,255,255);
  
  fill(0);
  int i = 0;
  float y = 10;
  for (Map.Entry user_phase :user_phase_object.entrySet()) 
  {
    y+=20;
    fill(0);
    text((String)user_phase.getKey(), 0, y+3);
    
    
    HashMap<Integer,List<JSONObject>> phase_object = (HashMap<Integer,List<JSONObject>>)user_phase.getValue();
   
   for (Map.Entry objects :phase_object.entrySet()) 
  {
       int phase = (Integer)objects.getKey();
        
        int column = 0;
       for(JSONObject o : (List<JSONObject>) objects.getValue())
       {
         float x = map(column, 0, 10, columnToScreen.get(phase), columnToScreen.get(phase) + width/8.0f);
         setPhaseColor(phase);
         ellipse(x,y,10,10);
         column++;
         if(column > 5)
         {
           column = 0;
           y += 14;
         }
       }
       /*
       */
       
    }
    i++;    
    smooth();
  }
}
  
  
  void drawBG()
  {
    nameWidth -= circleSize/1.5f;
    //eventWidth -= circleSize;
    strokeWeight(0);
    fill(#383838);
    rect(0,0,nameWidth, height);
    
    fill(#464545);
    rect(nameWidth,0,nameWidth + eventWidth, height);
    fill(#383838);
    rect(nameWidth + eventWidth,0,nameWidth + eventWidth*2.0f, height);
    fill(#464545);
    rect(nameWidth + eventWidth*2.0f,0,nameWidth + eventWidth*3.0f, height);
    fill(#383838);
    rect(nameWidth + eventWidth*3.0f,0,nameWidth + eventWidth*4.0f, height);
    fill(#464545);
    rect(nameWidth + eventWidth*4.0f,0,nameWidth + eventWidth*5.0f, height);
    fill(#383838);
    rect(nameWidth + eventWidth*5.0f,0,nameWidth + eventWidth*6.0f, height);
    nameWidth += circleSize/1.5f;
   // eventWidth += circleSize;
   stroke(255,255,255);
   fill(255,255,255);
    text("name", nameWidth/3.0f,10);
    text("phase 1", nameWidth + eventWidth/3.0f,10);
    text("phase 2", nameWidth + eventWidth + eventWidth/3.0f,10);
    text("phase 3", nameWidth + 2*eventWidth +eventWidth/3.0f,10);
    text("phase 4", nameWidth + 3*eventWidth +eventWidth/3.0f,10);
    text("phase 5", nameWidth + 4*eventWidth +eventWidth/3.0f,10);
    text("phase 6", nameWidth + 5*eventWidth + eventWidth/3.0f,10);
  }
  void setPhaseColor(int phase)
  {
       switch(phase)
    {
      case 1:
      fill(#33FF99);
      break;
      case 2:
      fill(#33CCFF);
      break;
      case 3:
      fill(#CCFF33);
      break;
      case 4:
      fill(#FF0066);
      break;
      case 5:
      fill(#CCFFFF);
      break;
      case 6:
      fill(#FF66CC);
      break;
      default:
      fill(0);
    }
  }
  

