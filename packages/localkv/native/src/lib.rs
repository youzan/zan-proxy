#[macro_use]
extern crate neon;
extern crate sled;

use sled::{ConfigBuilder, Tree};
use neon::scope::Scope;
use neon::vm::{Call, JsResult};
use neon::js::*;
use neon::js::error::*;
use neon::task::Task;

fn string_to_ptr<'a>(ptr_str: &str) -> Result<&'a sled::Tree, String> {
    let ptr_from_str = ptr_str
        .parse::<usize>()
        .map_err(|_| "invalid ptr".to_owned())?;
    let ptr = ptr_from_str as *mut sled::Tree;
    Ok(unsafe { &*ptr })
}

macro_rules! get_string_arg {
    ($call:ident, $scope:ident, $index:expr) => {
        $call.arguments
            .require($scope, $index)?
            .check::<JsString>()?
            .value()
    };
}

struct CreateTask {
    path: String,
}

impl CreateTask {
    fn new(path: String) -> CreateTask {
        CreateTask { path }
    }
}

impl Task for CreateTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let config = ConfigBuilder::new().path(&self.path).build();
        let tree = Tree::start(config).map_err(|_| "localkv start fail".to_owned())?;
        let ptr = Box::into_raw(Box::new(tree));
        let ptr_string = format!("{}", ptr as usize);
        Ok(ptr_string)
    }

    fn complete<'a, T: Scope<'a>>(
        self,
        scope: &'a mut T,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        result
            .map(|result| Ok(JsString::new(scope, result.as_ref()).unwrap()))
            .unwrap_or_else(|msg| JsError::throw(Kind::Error, msg.as_ref()))
    }
}

struct SetTask {
    ptr: String,
    key: String,
    value: String,
}

impl SetTask {
    fn new(ptr: String, key: String, value: String) -> SetTask {
        SetTask { ptr, key, value }
    }
}

impl Task for SetTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let tree = string_to_ptr(&self.ptr)?;
        let k = self.key.clone().into_bytes();
        let v = self.value.clone().into_bytes();
        tree.set(k, v).map_err(|_| "set error")?;
        let from_db = tree.get(&self.key.clone().into_bytes())
            .map(|result| {
                result.map_or("".to_owned(), |value| unsafe {
                    String::from_utf8_unchecked(value)
                })
            })
            .map_err(|_| "get error".to_owned())?;
        Ok(from_db)
    }

    fn complete<'a, T: Scope<'a>>(
        self,
        scope: &'a mut T,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        result
            .map(|result| Ok(JsString::new(scope, result.as_ref()).unwrap()))
            .unwrap_or_else(|msg| JsError::throw(Kind::Error, msg.as_ref()))
    }
}

struct GetTask {
    ptr: String,
    key: String,
}

impl GetTask {
    fn new(ptr: String, key: String) -> GetTask {
        GetTask { ptr, key }
    }
}

impl Task for GetTask {
    type Output = String;
    type Error = String;
    type JsEvent = JsString;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let tree = string_to_ptr(&self.ptr)?;
        let from_db = tree.get(&self.key.clone().into_bytes())
            .map(|result| {
                result.map_or("".to_owned(), |value| unsafe {
                    String::from_utf8_unchecked(value)
                })
            })
            .map_err(|_| "get error".to_owned())?;
        Ok(from_db)
    }

    fn complete<'a, T: Scope<'a>>(
        self,
        scope: &'a mut T,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        result
            .map(|result| Ok(JsString::new(scope, result.as_ref()).unwrap()))
            .unwrap_or_else(|msg| JsError::throw(Kind::Error, msg.as_ref()))
    }
}

struct RemoveTask {
    ptr: String,
    key: String,
}

impl RemoveTask {
    fn new(ptr: String, key: String) -> RemoveTask {
        RemoveTask {
            ptr,
            key,
        }
    }
}

impl Task for RemoveTask {
    type Output = ();
    type Error = String;
    type JsEvent = JsUndefined;

    fn perform(&self) -> Result<Self::Output, Self::Error> {
        let tree = string_to_ptr(&self.ptr)?;
        tree.del(&self.key.clone().into_bytes())
            .map_err(|_| "del error".to_owned())?;
        Ok(())
    }

    fn complete<'a, T: Scope<'a>>(
        self,
        _scope: &'a mut T,
        result: Result<Self::Output, Self::Error>,
    ) -> JsResult<Self::JsEvent> {
        result
            .map(|_| Ok(JsUndefined::new()))
            .unwrap_or_else(|msg| JsError::throw(Kind::Error, msg.as_ref()))
    }
}

fn create(call: Call) -> JsResult<JsUndefined> {
    let scope = call.scope;
    let path = get_string_arg!(call, scope, 0);
    let callback = call.arguments.require(scope, 1)?.check::<JsFunction>()?;
    CreateTask::new(path).schedule(callback);
    Ok(JsUndefined::new())
}

fn set(call: Call) -> JsResult<JsUndefined> {
    let scope = call.scope;
    let ptr = get_string_arg!(call, scope, 0);
    let key = get_string_arg!(call, scope, 1);
    let value = get_string_arg!(call, scope, 2);
    let callback = call.arguments.require(scope, 3)?.check::<JsFunction>()?;
    SetTask::new(ptr, key, value).schedule(callback);
    Ok(JsUndefined::new())
}

fn get(call: Call) -> JsResult<JsUndefined> {
    let scope = call.scope;
    let ptr = get_string_arg!(call, scope, 0);
    let key = get_string_arg!(call, scope, 1);
    let callback = call.arguments.require(scope, 2)?.check::<JsFunction>()?;
    GetTask::new(ptr, key).schedule(callback);
    Ok(JsUndefined::new())
}

fn close(call: Call) -> JsResult<JsUndefined> {
    let scope = call.scope;
    let ptr = get_string_arg!(call, scope, 0);
    let tree = string_to_ptr(&ptr).expect("invalid pointer");
    tree.flush().expect("sync fail");
    unsafe {
        let t = Box::from_raw(tree as *const sled::Tree as *mut sled::Tree);
        drop(t);
    }
    Ok(JsUndefined::new())
}

fn remove(call: Call) -> JsResult<JsUndefined> {
    let scope = call.scope;
    let ptr = get_string_arg!(call, scope, 0);
    let key = get_string_arg!(call, scope, 1);
    let callback = call.arguments.require(scope, 2)?.check::<JsFunction>()?;
    RemoveTask::new(ptr, key).schedule(callback);
    Ok(JsUndefined::new())
}

register_module!(m, {
    m.export("create", create)?;
    m.export("set", set)?;
    m.export("get", get)?;
    m.export("remove", remove)?;
    m.export("close", close)?;

    Ok(())
});
