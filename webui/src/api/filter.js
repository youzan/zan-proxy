/**
 * Created by tsxuehu on 17/1/9.
 */

import axios from "axios";
var api = {
    saveFilters(filters){
        return axios.post('/filter/savefilters', filters);
    }

};
export default api;
