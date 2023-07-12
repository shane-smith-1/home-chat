"use client";

/*
# Copyright 2022, Google, Inc.
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
import { useState, useEffect, useMemo } from "react";
import DrawDocument from "./DrawDocument";
import EntityInfoDialog from "./EntityInfoDialog";
import PageSelector from "./PageSelector";
import NoData from "./NoData";
import PropTypes from "prop-types";
import EntityList from "./EntityList";
import { toBase64 } from "./utils";

function DocAIView(props) {
  const [hilight, setHilight] = useState(null);
  const [entityInfoDialogOpen, setEntityInfoDialogOpen] = useState(false);
  const [entityInfoDialogEntity, setEntityInfoDialogEntity] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  function entityOnClick(entity) {
    setHilight(entity);
  }

  function onInfoClick(entity) {
    setEntityInfoDialogOpen(true);
    setEntityInfoDialogEntity(entity);
  }

  useEffect(() => {
    setImageSize({ width: 0, height: 0 });
  }, [props.data]);

  const [currentPage, setCurrentPage] = useState(0);

  const imageData = useMemo(
    () => toBase64(props.data.pages[currentPage].image.content.data),
    [currentPage, props.data.pages]
  );

  useEffect(() => {
    console.log("hello");

    if (imageSize.width === 0 || imageSize.height === 0 || !imageData) {
      // We don't know the image size.  Lets find out.
      const img = document.createElement("img");
      img.onload = function (event) {
        console.log("natural:", img.naturalWidth, img.naturalHeight);
        console.log("width,height:", img.width, img.height);
        console.log("offsetW,offsetH:", img.offsetWidth, img.offsetHeight);
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = `data:image/png;base64,${imageData}`;
    }
  }, [imageData]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!props.data) {
    return <NoData />;
  }

  return (
    <div className="flex w-full h-[800px]">
      <div className="min-w-[200px] max-w-[350px] overflow-auto">
        <EntityList
          data={props.data}
          onInfoClick={onInfoClick}
          entityOnClick={entityOnClick}
          hilight={hilight}
        />
      </div>
      <div className="flex-grow hidden xs:flex">
        <div className="flex-grow">
          <DrawDocument
            imageData={imageData}
            imageSize={imageSize}
            entities={props.data.entities.slice()}
            hilight={hilight}
            entityOnClick={entityOnClick}
          />
        </div>
        <div className="overflow-auto">
          <PageSelector
            data={props.data}
            onPageChange={setCurrentPage}
          ></PageSelector>
        </div>
      </div>
      <EntityInfoDialog
        open={entityInfoDialogOpen}
        close={() => setEntityInfoDialogOpen(false)}
        entity={entityInfoDialogEntity}
      ></EntityInfoDialog>
    </div>
  );
} // DocAIView

DocAIView.propTypes = {
  data: PropTypes.object,
};

export default DocAIView;
